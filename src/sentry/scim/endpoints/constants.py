from enum import Enum

SCIM_API_LIST = "urn:ietf:params:scim:api:messages:2.0:ListResponse"
SCIM_SCHEMA_USER = "urn:ietf:params:scim:schemas:core:2.0:User"
SCIM_SCHEMA_GROUP = "urn:ietf:params:scim:schemas:core:2.0:Group"
SCIM_SCHEMA_SCHEMA = "urn:ietf:params:scim:schemas:core:2.0:Schema"
ERR_ONLY_OWNER = "You cannot remove the only remaining owner of the organization."

SCIM_API_ERROR = "urn:ietf:params:scim:api:messages:2.0:Error"
SCIM_API_PATCH = "urn:ietf:params:scim:api:messages:2.0:PatchOp"
SCIM_COUNT = 100

SCIM_404_USER_RES = {
    "schemas": [SCIM_API_ERROR],
    "detail": "User not found.",
}

SCIM_404_GROUP_RES = {
    "schemas": [SCIM_API_ERROR],
    "detail": "Group not found.",
}

SCIM_409_USER_EXISTS = {
    "schemas": [SCIM_API_ERROR],
    "detail": "User already exists in the database.",
}
SCIM_400_INVALID_FILTER = {
    "schemas": [SCIM_API_ERROR],
    "scimType": "invalidFilter",
}

SCIM_400_INTEGRITY_ERROR = {
    "schemas": [SCIM_API_ERROR],
    "detail": "Database Integrity Error.",
}

SCIM_400_TOO_MANY_PATCH_OPS_ERROR = {
    "schemas": [SCIM_API_ERROR],
    "detail": "Too many patch ops sent, limit is 100.",
}

SCIM_400_UNSUPPORTED_ATTRIBUTE = {
    "schemas": [SCIM_API_ERROR],
    "detail": "Invalid Replace attr. Only displayName and members supported.",
}

SCIM_USER_ATTRIBUTES_SCHEMA = {
    "id": SCIM_SCHEMA_USER,
    "name": "User",
    "description": "SCIM User maps to Sentry Organization Member",
    "attributes": [
        {
            "name": "userName",
            "type": "string",
            "multiValued": False,
            "description": "Unique identifier for the User, which for Sentry is an email address.",
            "required": True,
            "caseExact": False,
            "mutability": "read",
            "returned": "default",
            "uniqueness": "server",
        },
        {
            "name": "emails",
            "type": "complex",
            "multiValued": True,
            "description": "Email addresses for the user.  The value SHOULD be canonicalized by the service provider, e.g., 'bjensen@example.com' instead of 'bjensen@EXAMPLE.COM'. Canonical type values of 'work', 'home', and 'other'.",
            "required": False,
            "subAttributes": [
                {
                    "name": "value",
                    "type": "string",
                    "multiValued": False,
                    "description": "Email addresses for the user.  The value is canonicalized to be lowercase.",
                    "required": False,
                    "caseExact": False,
                    "mutability": "read",
                    "returned": "default",
                    "uniqueness": "none",
                },
                {
                    "name": "display",
                    "type": "string",
                    "multiValued": False,
                    "description": "A human-readable name, primarily used for display purposes.  READ-ONLY.",
                    "required": False,
                    "caseExact": False,
                    "mutability": "read",
                    "returned": "default",
                    "uniqueness": "none",
                },
                {
                    "name": "type",
                    "type": "string",
                    "multiValued": False,
                    "description": "A label indicating the attribute's function, e.g., 'work' or 'home'.",
                    "required": False,
                    "caseExact": False,
                    "canonicalValues": ["work", "home", "other"],
                    "mutability": "read",
                    "returned": "default",
                    "uniqueness": "none",
                },
                {
                    "name": "primary",
                    "type": "boolean",
                    "multiValued": False,
                    "description": "A Boolean value indicating the 'primary' or preferred attribute value for this attribute. The primary attribute value 'true' MUST appear no more than once.",
                    "required": False,
                    "mutability": "read",
                    "returned": "default",
                },
            ],
            "mutability": "read",
            "returned": "default",
            "uniqueness": "none",
        },
    ],
    "meta": {
        "resourceType": "Schema",
        "location": "/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User",
    },
}

SCIM_GROUP_ATTRIBUTES_SCHEMA = {
    "id": SCIM_SCHEMA_GROUP,
    "name": "Group",
    "description": "SCIM Group maps to Sentry Team",
    "attributes": [
        {
            "name": "displayName",
            "type": "string",
            "multiValued": False,
            "description": "A human-readable name for the Group. REQUIRED.",
            "required": False,
            "caseExact": False,
            "mutability": "readWrite",
            "returned": "default",
            "uniqueness": "server",
        },
    ],
    "meta": {
        "resourceType": "Schema",
        "location": "/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:Group",
    },
}

SCIM_SCHEMA_LIST = [SCIM_USER_ATTRIBUTES_SCHEMA, SCIM_GROUP_ATTRIBUTES_SCHEMA]


class GroupPatchOps(str, Enum):
    ADD = "add"
    REMOVE = "remove"
    REPLACE = "replace"
