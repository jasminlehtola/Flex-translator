"""
groups.py

Routes for managing document groups per user.

Includes:
- Fetching user's groups
- Creating new groups
- Adding/removing documents from groups
- Deleting groups
"""

from flask import Blueprint, request, jsonify, current_app
from app.models.db_models import Group, GroupDocument, Document
from app import db
from app.routes.wrappers import require_user_access

groups_bp = Blueprint('groups', 'groups', url_prefix='/groups')

@groups_bp.route('', methods=['GET'])
@require_user_access
def get_groups():
    """
    Get all groups belonging to a user.

    Query parameters:
        - user_id: int (required)

    Returns:
        - 200 OK with list of groups
        - 400 if user_id missing
        - 500 on server error
    """
    try: 
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400

        groups = current_app.groups_service.get_groups_by_user(user_id)

        return jsonify(groups), 200
    
    except Exception as e:
        print("Group fetch error:", e)
        return jsonify({"error": str(e)}), 500


@groups_bp.route('', methods=['POST'])
@require_user_access
def create_group():
    """
    Create a new document group.

    Request JSON:
        {
            "name": "Group Name",
            "user_id": 123,
            "documents": [1, 2, 3] (optional)
        }

    Returns:
        - 201 Created with group data
        - 400 if required fields missing
        - 500 on server error
    """
    try:
        data = request.json
        name = data.get('name')
        user_id = data.get('user_id')
        document_ids = data.get('documents', [])

        if not name or not user_id:
            return jsonify({'error': 'Missing data'}), 400

        group = current_app.groups_service.create_group(
                name=name,
                user_id=user_id,
                document_ids=document_ids
            )

        return jsonify(group), 201

    except Exception as e:
        print("Error creating group:", e)
        return jsonify({"error": "Failed to create group."}), 500


@groups_bp.route('/<int:groups_id>/documents', methods=['POST'])
@require_user_access
def add_document_to_group(groups_id):
    """
    Add a document to a group.

    Request JSON:
        {
            "document_id": 123
        }

    Returns:
        - 200 OK or custom status from service
        - 500 on server error
    """
    try:
        data = request.json
        document_id = data.get('document_id')

        result = current_app.groups_service.add_document_to_group(
            groups_id=groups_id,
            document_id=document_id
        )

        return jsonify(result), result.get('status', 200)
    
    except Exception as e:
        print("Error adding document to group:", e)
        return jsonify({"error": "Failed to add document to group."}), 500


@groups_bp.route('/<int:groups_id>/documents/<int:doc_id>', methods=['DELETE'])
@require_user_access
def remove_document_from_group(groups_id, doc_id):
    """
    Remove a document from a group.

    Returns:
        - 200 OK or custom status from service
        - 500 on server error
    """
    try:
        result = current_app.groups_service.remove_document_from_group(
            groups_id=groups_id,
            document_id=doc_id
        )

        return jsonify(result), result.get('status', 200)

    except Exception as e:
        print("Error removing document from group:", e)
        return jsonify({"error": "Failed to remove document from group."}), 500


@groups_bp.route('/<int:groups_id>', methods=['DELETE'])
@require_user_access
def delete_group(groups_id):
    """
    Delete a group and all its document associations.

    Returns:
        - 200 OK or custom status from service
        - 500 on server error
    """
    try:
        result = current_app.groups_service.delete_group(groups_id)

        return jsonify(result), result.get('status', 200)

    except Exception as e:
        print("Error deleting group:", e)
        return jsonify({"error": "Failed to delete group."}), 500