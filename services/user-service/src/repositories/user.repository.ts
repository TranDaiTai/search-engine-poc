import prisma from '../config/database';

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      include: { role: { select: { name: true } } }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: { select: { name: true } } }
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } }
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: { role: { select: { name: true } } }
    });
  }

  async create(data: any) {
    return prisma.user.create({
      data,
      include: { role: { select: { name: true } } }
    });
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: { select: { name: true } } }
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }

  // Address methods
  async addAddress(userId: string, data: any) {
    return prisma.address.create({
      data: { ...data, userId }
    });
  }

  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId }
    });
  }
}
