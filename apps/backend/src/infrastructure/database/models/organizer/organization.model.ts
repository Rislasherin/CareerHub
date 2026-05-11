import { InferSchemaType,model,models } from "mongoose";
import { organizationSchema } from "@infrastructure/database/schema/organization/organization.schema";


export type OrganizationDocument = InferSchemaType<typeof organizationSchema> & {_id:string};

export const OrganizationModel = models.Organization || model("Organization",organizationSchema)