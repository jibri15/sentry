from rest_framework.response import Response

from .constants import SCIM_SCHEMA_LIST
from .utils import SCIMEndpoint


class OrganizationSCIMSchemaIndex(SCIMEndpoint):
    def get(self, request, organization):
        return Response(
            self.list_api_format(
                request,
                len(SCIM_SCHEMA_LIST),
                SCIM_SCHEMA_LIST,
            )
        )
