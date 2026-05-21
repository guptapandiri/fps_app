import { Request, Response } from "express";
import { addCustomer, editCustomer, getCustomers, deleteCustomer } from "./customer.service.ts";
import { z } from "zod";
import type { Customer } from "../../types.ts";

const customerSchema = z.object({
    name: z.string().max(100),
    rcNumber: z.string().max(50),
    phone: z.string().max(20),
    address: z.string().max(200),
});


async function getCustomersHandler(request: Request, response: Response){
    try {
        const customers = await getCustomers();
        response.json({ status: 'success', data: customers });
    } catch (err) {
        response.status(500).json({ status: 'error', message: 'Failed to fetch customers' });
    }
}

async function addCustomerHandler(request: Request, response: Response){
    const parseResult = customerSchema.safeParse(request.body);

    if(!parseResult.success){
        return response.status(400).json({ status: 'error', message: 'Invalid input' });
    }

    try {
        const createdCustomer = await addCustomer(parseResult.data);
        response.status(201).json({ status: 'success', data: createdCustomer });
    } catch (err) {
        response.status(500).json({ status: 'error', message: 'Failed to create customer' });
    }
}

async function editCustomerHandler(request: Request, response: Response){
    const { id } = request.params as { id: string };
    const parseResult = customerSchema.safeParse(request.body);

    if(!parseResult.success){
        return response.status(400).json({ status: 'error', message: 'Invalid input' });
    }

    try {
        const updatedCustomer = await editCustomer(id, parseResult.data);

        if(!updatedCustomer){
            return response.status(404).json({ status: 'error', message: 'Customer not found' });
        }

        response.json({ status: 'success', data: updatedCustomer });
    } catch (err) {
        response.status(500).json({ status: 'error', message: 'Failed to update customer' });
    }
}

async function deleteCustomerHandler(request: Request, response: Response){
    const { id } = request.params as { id: string };

    try {
        const deleted = await deleteCustomer(id);

        if(!deleted){
            return response.status(404).json({ status: 'error', message: 'Customer not found' });
        }

        response.json({ status: 'success', message: 'Customer deleted' });
    } catch (err) {
        response.status(500).json({ status: 'error', message: 'Failed to delete customer' });
    }
}

export {
    getCustomersHandler,
    addCustomerHandler,
    editCustomerHandler,
    deleteCustomerHandler,
}
