import { Organization } from "@domain/entities/Organization";
import { UserStatus } from "@domain/enums/user.status.enum";
import { OrganizationDocument } from "@infrastructure/database/models/organizer/organization.model";

export const toOrganizationEntity = (
    doc:OrganizationDocument
) : Organization => {
    return Organization.create({
        id:doc._id.toString(),
        name:doc.name,
        city:doc.city,
        state:doc.state,
        studentCountRange:doc.studentCountRange,
        status: doc.status as UserStatus,
        createdAt:doc.createdAt,
        updatedAt:doc.updatedAt

    })
}

export const toOrganizationPersistence = (
    entity:Organization
) =>{
    const props = entity.toJSON()
    return{
        name:props.name,
        city:props.city,
        studentCountRange:props.studentCountRange,
        status:props.status
    }
}