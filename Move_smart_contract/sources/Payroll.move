module Payroll_addr::Payroll {
    use aptos_framework::event;
    use std::signer;
    use aptos_std::vector;
    use aptos_std::table::Table;


    struct Employee {
        id: u64,
        address: address,
        hourly_rate: u64,
        overtime_rate: u64,
        hours_worked: u64,
        overtime_hours: u64,
        attendance: u64,
        turnover: u64,
        payroll_errors: u64,
        last_paid_day: u64, // Keeps track of the last day the employee was paid
        role: vector<u8>, // Describe the employee's role
        confirmed: bool, // New property to store confirmation status
    }

    struct PayrollSystem {
        employees: vector<Employee>,
        total_hours: u64,
        total_overtime: u64,
        total_payroll_errors: u64,
    }

    struct PreCheckEvent {
        employee_id: u64,
        address: address,
    }
        public fun initialize(_sender: &signer): PayrollSystem {
        PayrollSystem {
            employees: vector::empty(),
            total_hours: 0,
            total_overtime: 0,
            total_payroll_errors: 0,
        }
    }
    public fun add_employee(
        payroll: &mut PayrollSystem,
        id: u64,
        address: address,
        hourly_rate: u64,
        overtime_rate: u64,
        role: vector<u8>
    ) {
        let employee = Employee {
            id,
            address,
            hourly_rate,
            overtime_rate,
            hours_worked: 0,
            overtime_hours: 0,
            attendance: 0,
            turnover: 0,
            payroll_errors: 0,
            last_paid_day: 0,
            role, // Initialize role
            confirmed: false, // Initialize confirmation status
        };
        vector::push_back(&mut payroll.employees, employee);
    }
    public fun record_hours(
        payroll: &mut PayrollSystem,
        id: u64,
        hours_worked: u64,
        overtime_hours: u64
    ) {
        let employee = find_employee(&mut payroll.employees, id);
        *employee.hours_worked = *employee.hours_worked + hours_worked;
        *employee.overtime_hours = *employee.overtime_hours + overtime_hours;
        payroll.total_hours = payroll.total_hours + hours_worked;
        payroll.total_overtime =payroll.total_overtime + overtime_hours;
    }

        public fun find_employee(employees: &mut vector<Employee>, id: u64): &mut Employee {
        let i = 0; // Declare and initialize i
        let length = Vector::length(employees);
        
        while (i < length) {
            let employee = Vector::borrow_mut(employees, i);
            if (employee.id == id) {
                return employee;
            }
            i=i+1
        };
        Employee
        abort(1); // Employee not found
    }




    
}
