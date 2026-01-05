# app/schemas/marshmallow_schemas.py

from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow_sqlalchemy.fields import Nested
from app.models.db_models import User, Document, Chunk, Group, Analytics
from marshmallow import fields

# --------------------------------------
# USER SCHEMA
# --------------------------------------
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True            # So marshmallow can return a model instance when loading
        include_relationships = True    # If you have relationships to show
        include_fk = False              # If you want to include foreign key columns in the schema

# --------------------------------------
# CHUNK SCHEMA
# --------------------------------------
class ChunkSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Chunk
        load_instance = True
        include_relationships = True
        include_fk = True

# --------------------------------------
# DOCUMENT SCHEMA
# --------------------------------------
class DocumentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Document
        load_instance = True
        include_relationships = True
        include_fk = True
        chunks = Nested(ChunkSchema, many=True)

    # If you want to automatically nest related chunks inside the Document data:
    # (requires `Document` model has `chunks` relationship + backref)
    
# --------------------------------------
# GROUP SCHEMA
# --------------------------------------
class GroupSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Group
        load_instance = True
        include_relationships = True
        include_fk = True

    documents = fields.List(fields.Integer(), dump_only=True)  # Palauttaa dokumenttien ID:t

# --------------------------------------
# ANALYTICS SCHEMA
# --------------------------------------
class AnalyticsSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Analytics
        load_instance = True
        include_relationships = True
        include_fk = True
