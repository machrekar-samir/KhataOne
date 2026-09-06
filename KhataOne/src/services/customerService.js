export const addCustomer = (customers, value) => [...customers, { ...value, id: crypto.randomUUID() }]
export const updateCustomer = (customers, value) => customers.map((item) => item.id === value.id ? value : item)
export const removeCustomer = (customers, id) => customers.filter((item) => item.id !== id)