import { HRUser } from "@domain/entities/HRUser";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { HRUserDocument } from "@infrastructure/database/models/company/hr-user.model";

export const toHRUserEntity = (doc: HRUserDocument): HRUser => {
  return HRUser.create({
    id: doc._id.toString(),
    companyId: doc.companyId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    password: doc.password,
    designation: doc.designation || "",
    role: doc.role as Role,
    status: doc.status as UserStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toHRUserPersistence = (entity: HRUser) => {
  const props = entity.toJSON();

  return {
    companyId: props.companyId,
    firstName: props.firstName,
    lastName: props.lastName,
    email: props.email,
    password: props.password,
    designation: props.designation,
    role: props.role,
    status: props.status,
  };
};
