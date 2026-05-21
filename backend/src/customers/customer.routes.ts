import express from 'express';
import { getCustomersHandler, addCustomerHandler, editCustomerHandler, deleteCustomerHandler } from './customer.controller.ts';

const customerRoutes = express.Router();

customerRoutes.get('/', getCustomersHandler);
customerRoutes.post('/', addCustomerHandler);
customerRoutes.put('/:id', editCustomerHandler);
customerRoutes.delete('/:id', deleteCustomerHandler);

export { customerRoutes };
