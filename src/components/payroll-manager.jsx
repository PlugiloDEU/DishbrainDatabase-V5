"use client";
import React, { useState } from "react";
import Component3DButtonDesign from "./component-3-d-button-design";

const PayrollManager = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: "", salary: "", hours: "" }
  ]);
  const [totalPayroll, setTotalPayroll] = useState(0);

  const handleInputChange = (id, field, value) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const addEmployee = () => {
    setEmployees([
      ...employees,
      { id: employees.length + 1, name: "", salary: "", hours: "" }
    ]);
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const calculatePayroll = () => {
    const total = employees.reduce((sum, emp) => {
      const salary = parseFloat(emp.salary) || 0;
      const hours = parseFloat(emp.hours) || 0;
      return sum + (salary * hours);
    }, 0);
    setTotalPayroll(total);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="font-cabin text-2xl text-center mb-6">
        Payroll Manager
      </h1>
      <div className="flex flex-col space-y-4">
        {employees.map((employee) => (
          <div key={employee.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Employee {employee.id}</h3>
              <button
                onClick={() => removeEmployee(employee.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={employee.name}
                onChange={(e) => handleInputChange(employee.id, "name", e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Hourly Rate"
                value={employee.salary}
                onChange={(e) => handleInputChange(employee.id, "salary", e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Hours Worked"
                value={employee.hours}
                onChange={(e) => handleInputChange(employee.id, "hours", e.target.value)}
                className="p-2 border rounded"
              />
            </div>
          </div>
        ))}

        <div className="flex space-x-4">
          <Component3DButtonDesign onClick={addEmployee}>
            Add Employee
          </Component3DButtonDesign>
          <Component3DButtonDesign onClick={calculatePayroll}>
            Calculate Payroll
          </Component3DButtonDesign>
        </div>

        {totalPayroll > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Total Payroll</h3>
            <p className="text-2xl font-bold">€{totalPayroll.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollManager;