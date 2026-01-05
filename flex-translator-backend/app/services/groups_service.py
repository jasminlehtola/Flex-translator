"""
groups_service.py

Service class for managing document groups.

Responsibilities:
- Creating groups and assigning documents
- Fetching user’s groups
- Adding/removing documents in groups
- Deleting groups
"""

from app.extensions import db
from app.models.db_models import Group, GroupDocument

class GroupsService:
    def get_groups_by_user(self, user_id: int):
        """
        Returns all groups for a given user.

        Parameters:
            user_id (int): ID of the user

        Returns:
            List of group dicts with IDs, names, and associated document IDs.
        """
        groups = Group.query.filter_by(user_id=user_id).all()
        return [
            {
                'id': g.id,
                'name': g.name,
                'documents': [d.id for d in g.documents]
            }
            for g in groups
        ]


    def create_group(self, name: str, user_id: int, document_ids: list[int]):
        """
        Creates a new group and links documents to it.

        Parameters:
            name (str): Group name
            user_id (int): Owner of the group
            document_ids (list[int]): List of document IDs to add

        Returns:
            Dict with group ID, name, and attached document IDs.
        """
        if not name or not user_id:
            raise ValueError("Missing required fields: name or user_id")
        
        group = Group(name=name, user_id=user_id)
        db.session.add(group)
        db.session.commit()

        for doc_id in document_ids:
            link = GroupDocument(groups_id=group.id, document_id=doc_id)
            db.session.add(link)

        db.session.commit()
        return {'id': group.id, 'name': group.name, 'documents': document_ids}


    def add_document_to_group(self, groups_id: int, document_id: int):
        """
        Adds a document to an existing group.

        Parameters:
            groups_id (int): Group ID
            document_id (int): Document ID to add

        Returns:
            Dict with message and HTTP status
        """
        existing = GroupDocument.query.filter_by(groups_id=groups_id, document_id=document_id).first()
        if existing:
            return {'message': 'Already in group', 'status': 200}

        link = GroupDocument(groups_id=groups_id, document_id=document_id)
        db.session.add(link)
        db.session.commit()
        return {'message': 'Added', 'status': 201}


    def remove_document_from_group(self, groups_id: int, document_id: int):
        """
        Removes a document from a group.

        Parameters:
            groups_id (int): Group ID
            document_id (int): Document ID to remove

        Returns:
            Dict with message and HTTP status
        """
        link = GroupDocument.query.filter_by(groups_id=groups_id, document_id=document_id).first()
        if not link:
            return {'error': 'Not found', 'status': 404}

        db.session.delete(link)
        db.session.commit()
        return {'message': 'Removed', 'status': 200}


    def delete_group(self, groups_id: int):
        """
        Deletes a group and its relationships.

        Parameters:
            groups_id (int): Group ID to delete

        Returns:
            Dict with message and HTTP status
        """
        group = Group.query.get(groups_id)
        if not group:
            return {'error': 'Group not found', 'status': 404}

        db.session.delete(group)
        db.session.commit()
        return {'message': 'Group deleted', 'status': 200}