import { SuperAdmin } from "@domain/entities/SuperAdmin";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { SuperAdminDocument } from "@infrastructure/database/models/superadmin/super-admin.model";

export const toSuperAdminEntity = (doc: SuperAdminDocument): SuperAdmin => {
  return SuperAdmin.create({
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    password: doc.password,
    role: doc.role as Role,
    status: doc.status as UserStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toSuperAdminPersistence = (entity: SuperAdmin) => {
  const props = entity.toJSON();

  return {
    firstName: props.firstName,
    lastName: props.lastName,
    email: props.email,
    password: props.password,
    role: props.role,
    status: props.status,
  };
};
