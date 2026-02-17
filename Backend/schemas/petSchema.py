from marshmallow import Schema, fields, validate

breeds = [ 'Benshis', 'Moomis', 'Pooshis' ]
actionTypes = [ 'Play', 'Feed', 'Scold', 'Hug', 'Rename' ]

# GET requests body validation
class PlainPetSchema(Schema):
    Id = fields.Integer(dump_only=True)
    Name = fields.String(dump_only=True)
    Birthday = fields.String(dump_only=True) # UTC format as string
    HungerLevel = fields.Integer(dump_only=True)
    HappinessLevel = fields.Integer(dump_only=True)
    FriendshipLevel = fields.Integer(dump_only=True)
    LastInteractedWith = fields.String(dump_only=True) # UTC format as string
    IsDead = fields.Boolean(dump_only=True)

class PlainBreedSchema(Schema):
    Id = fields.Integer(dump_only=True)
    Type = fields.String(required=True, validate=validate.OneOf(breeds))

class PlainActionSchema(Schema):
    Id = fields.Integer(dump_only=True)
    Type = fields.String(required=True, validate=validate.OneOf(actionTypes))

class PlainPetUserSchema(Schema):
    Id = fields.Integer(dump_only=True)
    Username = fields.String(required=True)
    AuthSubject = fields.String(required=True)

# POST schema requests validation
class NewPetSchema(Schema):
    Name = fields.String(required = True)
    UserId = fields.Integer(required = True, load_only=True)
    BreedType = fields.String(required = True, validate=validate.OneOf(breeds))

# PUT schema requests validation
class UpdatePetSchema(Schema):
    Name = fields.String(required=False)
    InteractAction = fields.String(required=True, allow_none=True, validate=validate.OneOf(actionTypes))

# GET schema response formatting, ignore BreedType as it's only for POST request validation
class PetSchema(PlainPetSchema):
    breed = fields.Nested(PlainBreedSchema, dump_only=True)
    user = fields.Nested(PlainPetUserSchema, dump_only=True)
    message = fields.String(dump_only=True)

# GET schema response for sending back types of breeds and actions
class PetOptionsSchema(Schema):
    Breeds = fields.List(fields.Nested(PlainBreedSchema), dump_only=True)
    Actions = fields.List(fields.Nested(PlainActionSchema), dump_only=True)

class PetReportSchema(Schema):
    Id = fields.Integer(dump_only=True)
    Name = fields.String(dump_only=True)
    When = fields.String(dump_only=True) # UTC format as string
    breed = fields.Nested(PlainBreedSchema, dump_only=True)
    action = fields.Nested(PlainActionSchema, dump_only=True)