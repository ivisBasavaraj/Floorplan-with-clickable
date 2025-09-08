from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from models import FloorPlanStats
from auth import get_current_user

dashboard_bp = Blueprint('dashboard', __name__)

# Get MongoDB connection
def get_db():
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring'))
    return client.get_default_database()

@dashboard_bp.route('/')
def dashboard_home():
    """Main dashboard overview"""
    try:
        current_user = get_current_user()
        if not current_user:
            return redirect(url_for('dashboard.login'))
        
        db = get_db()
        
        # Get statistics
        query = {}
        if current_user.get('role') != 'admin':
            query['user_id'] = current_user['_id']
        
        total_floorplans = db.floorplans.count_documents(query)
        
        # Get recent floor plans
        recent_floorplans = list(db.floorplans.find(query)
                               .sort('last_modified', -1)
                               .limit(5))
        
        # Calculate overall booth statistics
        all_floorplans = list(db.floorplans.find(query))
        overall_stats = {
            'total_booths': 0,
            'available': 0,
            'reserved': 0,
            'sold': 0,
            'on_hold': 0
        }
        
        for fp in all_floorplans:
            stats = FloorPlanStats.calculate_booth_stats(fp)
            for key in overall_stats:
                overall_stats[key] += stats.get(key, 0)
        
        # Process recent floor plans for display
        for fp in recent_floorplans:
            fp['_id'] = str(fp['_id'])
            fp['stats'] = FloorPlanStats.calculate_booth_stats(fp)
        
        return render_template('dashboard/home.html',
                             current_user=current_user,
                             total_floorplans=total_floorplans,
                             recent_floorplans=recent_floorplans,
                             overall_stats=overall_stats)
    
    except Exception as e:
        flash(f'Error loading dashboard: {str(e)}', 'error')
        return render_template('dashboard/error.html', error=str(e))

@dashboard_bp.route('/floorplans')
def floorplans_list():
    """List all floor plans"""
    try:
        current_user = get_current_user()
        if not current_user:
            return redirect(url_for('dashboard.login'))
        
        db = get_db()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = 10
        search = request.args.get('search', '')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        
        if current_user.get('role') != 'admin':
            query['user_id'] = current_user['_id']
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get floor plans
        floorplans = list(db.floorplans.find(query)
                         .sort('last_modified', -1)
                         .skip(skip)
                         .limit(limit))
        
        # Process floor plans
        for fp in floorplans:
            fp['_id'] = str(fp['_id'])
            fp['stats'] = FloorPlanStats.calculate_booth_stats(fp)
        
        # Get total count for pagination
        total = db.floorplans.count_documents(query)
        pages = (total + limit - 1) // limit
        
        return render_template('dashboard/floorplans.html',
                             current_user=current_user,
                             floorplans=floorplans,
                             page=page,
                             pages=pages,
                             search=search,
                             total=total)
    
    except Exception as e:
        flash(f'Error loading floor plans: {str(e)}', 'error')
        return render_template('dashboard/error.html', error=str(e))

@dashboard_bp.route('/floorplans/<floorplan_id>')
def floorplan_detail(floorplan_id):
    """View detailed floor plan information"""
    try:
        current_user = get_current_user()
        if not current_user:
            return redirect(url_for('dashboard.login'))
        
        db = get_db()
        
        # Get floor plan
        floorplan = db.floorplans.find_one({'_id': ObjectId(floorplan_id)})
        if not floorplan:
            flash('Floor plan not found', 'error')
            return redirect(url_for('dashboard.floorplans_list'))
        
        # Check access permissions
        if (current_user.get('role') != 'admin' and 
            floorplan.get('user_id') != current_user['_id']):
            flash('Access denied', 'error')
            return redirect(url_for('dashboard.floorplans_list'))
        
        # Get booth details and statistics
        booth_details = FloorPlanStats.get_booth_details(floorplan)
        stats = FloorPlanStats.calculate_booth_stats(floorplan)
        
        # Get creator information
        creator = None
        if floorplan.get('user_id'):
            creator = db.users.find_one({'_id': ObjectId(floorplan['user_id'])})
        
        floorplan['_id'] = str(floorplan['_id'])
        
        return render_template('dashboard/floorplan_detail.html',
                             current_user=current_user,
                             floorplan=floorplan,
                             booth_details=booth_details,
                             stats=stats,
                             creator=creator)
    
    except Exception as e:
        flash(f'Error loading floor plan: {str(e)}', 'error')
        return render_template('dashboard/error.html', error=str(e))

@dashboard_bp.route('/booths')
def booths_overview():
    """Overview of all booths across floor plans"""
    try:
        current_user = get_current_user()
        if not current_user:
            return redirect(url_for('dashboard.login'))
        
        db = get_db()
        
        # Build query based on user permissions
        query = {}
        if current_user.get('role') != 'admin':
            query['user_id'] = current_user['_id']
        
        # Get all floor plans and extract booth information
        floorplans = list(db.floorplans.find(query))
        all_booths = []
        
        for fp in floorplans:
            booth_details = FloorPlanStats.get_booth_details(fp)
            for booth in booth_details:
                booth['floorplan_name'] = fp['name']
                booth['floorplan_id'] = str(fp['_id'])
                all_booths.append(booth)
        
        # Filter booths based on query parameters
        status_filter = request.args.get('status')
        search = request.args.get('search', '')
        
        if status_filter:
            all_booths = [b for b in all_booths if b['status'] == status_filter]
        
        if search:
            all_booths = [b for b in all_booths 
                         if search.lower() in b.get('number', '').lower() or
                            search.lower() in b.get('exhibitor', {}).get('company_name', '').lower()]
        
        # Calculate summary statistics
        stats = {
            'total_booths': len(all_booths),
            'available': len([b for b in all_booths if b['status'] == 'available']),
            'reserved': len([b for b in all_booths if b['status'] == 'reserved']),
            'sold': len([b for b in all_booths if b['status'] == 'sold']),
            'on_hold': len([b for b in all_booths if b['status'] == 'on_hold'])
        }
        
        return render_template('dashboard/booths.html',
                             current_user=current_user,
                             booths=all_booths,
                             stats=stats,
                             status_filter=status_filter,
                             search=search)
    
    except Exception as e:
        flash(f'Error loading booths: {str(e)}', 'error')
        return render_template('dashboard/error.html', error=str(e))

@dashboard_bp.route('/analytics')
def analytics():
    """Analytics and reports dashboard"""
    try:
        current_user = get_current_user()
        if not current_user:
            return redirect(url_for('dashboard.login'))
        
        db = get_db()
        
        # Build query based on user permissions
        query = {}
        if current_user.get('role') != 'admin':
            query['user_id'] = current_user['_id']
        
        # Get all floor plans for analytics
        floorplans = list(db.floorplans.find(query))
        
        # Calculate analytics data
        analytics_data = {
            'floorplan_count': len(floorplans),
            'total_booths': 0,
            'booths_by_status': {'available': 0, 'reserved': 0, 'sold': 0, 'on_hold': 0},
            'floorplan_stats': []
        }
        
        for fp in floorplans:
            stats = FloorPlanStats.calculate_booth_stats(fp)
            
            # Add to totals
            analytics_data['total_booths'] += stats['total_booths']
            for status in analytics_data['booths_by_status']:
                analytics_data['booths_by_status'][status] += stats.get(status, 0)
            
            # Individual floor plan stats
            fp_stat = {
                'name': fp['name'],
                'id': str(fp['_id']),
                'stats': stats,
                'last_modified': fp['last_modified']
            }
            analytics_data['floorplan_stats'].append(fp_stat)
        
        return render_template('dashboard/analytics.html',
                             current_user=current_user,
                             analytics=analytics_data)
    
    except Exception as e:
        flash(f'Error loading analytics: {str(e)}', 'error')
        return render_template('dashboard/error.html', error=str(e))

@dashboard_bp.route('/login')
def login():
    """Login page for dashboard"""
    return render_template('dashboard/login.html')

@dashboard_bp.route('/logout')
def logout():
    """Logout from dashboard"""
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('dashboard.login'))