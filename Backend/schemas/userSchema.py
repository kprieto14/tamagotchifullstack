from marshmallow import Schema, fields, validate

# POST requests body validation
class PlainUserSchema(Schema):
    Email = fields.String(required=True, validate=validate.Email())
    Username = fields.String(required=True)
    AuthSubject = fields.String(required=True)

# PUT schema requests validation, not required in this iteration but added for future use
class UpdateUserSchema(Schema):
    Username = fields.String(required=False)
    Email = fields.String(required=False, validate=validate.Email())

# GET schema response formatting, not required in this iteration but added for future use
class UserSchema(PlainUserSchema):
    CreatedAt = fields.DateTime(dump_only=True)

class ReturnUserSchema(Schema):
    Id = fields.Integer(dump_only=True)