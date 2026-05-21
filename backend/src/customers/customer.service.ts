import { prisma } from "../../config/prisma.ts";
import type { Customer } from "../../types.js";

async function getCustomers() {
    const customers = await prisma.customer.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
    });
    return customers;
}

async function addCustomer(customer: Customer) {
    const created = await prisma.customer.create({ data: customer });
    return created;
}

async function editCustomer(id: string, input: Partial<Customer>) {
    const customer = await prisma.customer.findFirst({
        where: { id, isDeleted: false }
    });

    if (!customer) return null;

    return prisma.customer.update({
        where: { id },
        data: {
            ...(input.name && { name: input.name }),
            ...(input.rcNumber && { rcNumber: input.rcNumber }),
            ...(input.phone !== undefined && { phone: input.phone }),
            ...(input.address && { address: input.address }),
            ...(input.shop_no !== undefined && { shop_no: input.shop_no }),
            ...(input.aadhar !== undefined && { aadhar: input.aadhar }),
            ...(input.kgs !== undefined && { kgs: input.kgs }),
        }
    });
}

async function deleteCustomer(id: string) {
    const customer = await prisma.customer.findFirst({
        where: { id, isDeleted: false }
    });

    if (!customer) return null;

    return prisma.customer.update({
        where: { id },
        data: { isDeleted: true }
    });
}

export {
    getCustomers,
    addCustomer,
    editCustomer,
    deleteCustomer,
}
