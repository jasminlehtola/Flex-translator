from app.extensions import db
from sqlalchemy.dialects.mysql import MEDIUMTEXT
from datetime import datetime
from app.utils.default_prompts import (
    INITIAL_PROMPT,
    CONVERSATION_HISTORY_PROMPT,
    USER_PROMPT_INSTRUCTIONS,
    DICTIONARY_INSTRUCTIONS
)

class User(db.Model):
  """Represents an end user of the application."""
  __tablename__ = 'user'
  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  email = db.Column(db.String(255), nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.now)

  settings = db.relationship("UserSettings", uselist=False, back_populates="user")


class Document(db.Model):
  """Represents a document belonging to a user, either uploaded or pasted."""
  __tablename__ = 'document'
  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
  title = db.Column(db.String(255), nullable=False)
  original_text = db.Column(MEDIUMTEXT, nullable=False)
  final_translation = db.Column(MEDIUMTEXT)
  source_type = db.Column(db.Enum('pdf', 'paste'))
  created_at = db.Column(db.DateTime, default=datetime.now)
  modified_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

  chunks = db.relationship('Chunk', backref='document', cascade='all, delete-orphan', passive_deletes=True)


class Chunk(db.Model):
  """Represents a single chunk of a document used in translation."""
  __tablename__ = 'chunk'
  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  document_id = db.Column(db.Integer, db.ForeignKey('document.id', ondelete='CASCADE'), nullable=False)
  chunk_number = db.Column(db.Integer, nullable=False)
  chunk_content = db.Column(db.Text, nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.now)
  final_chunk_translation = db.Column(db.Text)


class Group(db.Model):
  """Represents a user-defined group of documents."""
  __tablename__ = 'groups'
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(255), nullable=False)
  user_id = db.Column(db.Integer, nullable=False)
  
  documents = db.relationship("Document", secondary="group_documents", backref="groups")


class GroupDocument(db.Model):
  """Join table for many-to-many relationship between groups and documents."""
  __tablename__ = 'group_documents'
  groups_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete="CASCADE"), primary_key=True)
  document_id = db.Column(db.Integer, db.ForeignKey('document.id', ondelete="CASCADE"), primary_key=True)


class UserSettings(db.Model):
  """Stores customizable translation prompt settings per user."""
  __tablename__ = "user_settings"
  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
  initial_prompt = db.Column(db.Text, nullable=False, default=INITIAL_PROMPT)
  conversation_history_prompt = db.Column(db.Text, nullable=False, default=CONVERSATION_HISTORY_PROMPT)
  user_prompt_instructions = db.Column(db.Text, nullable=False, default=USER_PROMPT_INSTRUCTIONS)
  dictionary_instructions = db.Column(db.Text, nullable=False, default=DICTIONARY_INSTRUCTIONS)

  user = db.relationship("User", uselist=False, back_populates="settings")


class Analytics(db.Model):
  """Stores analytics data on user translation behavior and tool usage."""
  __tablename__ = 'analytics'
  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  user_id = db.Column(db.Integer, nullable=True)
  document_id = db.Column(db.Integer, nullable=True)
  chunk_id = db.Column(db.Integer, nullable=True)

  source_type = db.Column(db.Enum('paste', 'pdf', 'docx'), nullable=True)
  translation_mode = db.Column(db.Enum('manual', 'auto', 'deeplAPIAuto'), nullable=True)
  chosen_model = db.Column(db.String(10), nullable=True)
  original_text = db.Column(db.Text, nullable=True)
  user_final = db.Column(db.Text, nullable=True)
  edited = db.Column(db.Boolean, nullable=True)
  user_prompts = db.Column(db.Text, nullable=True)
  user_dictionary = db.Column(db.Text, nullable=True)
  time_spent_sec = db.Column(db.Integer, nullable=True)
  created_at = db.Column(db.DateTime, default=datetime.now)
  updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
