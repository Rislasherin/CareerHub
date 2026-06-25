import { CollegeAdmin } from "@domain/entities/CollegeAdmin";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { CollegeAdminDocument } from "@infrastructure/database/models/organizer/college-admin.model";

export const toCollegeAdminEntity = (
  doc: CollegeAdminDocument,
): CollegeAdmin => {
  return CollegeAdmin.create({
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    password: doc.password,
    orgId: doc.orgId,
    role: doc.role as Role,
    status: doc.status as UserStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toCollegeAdminPersistence = (enitity: CollegeAdmin) => {
  const props = enitity.toJSON();

  return {
    firstName: props.firstName,
    lastName: props.lastName,

    email: props.email,
    password: props.password,

    orgId: props.orgId,

    role: props.role,
    status: props.status,
  };
};
