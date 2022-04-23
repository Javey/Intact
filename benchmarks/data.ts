export type DataItem = {
    key: number
    firstName: string
    lastName: string
    age: number
    address: string
}

export const data: DataItem[] = [];

for (let i = 0; i < 10; i++) {
    data.push({
        key: i++,
        firstName: 'John',
        lastName: 'Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
    });
}


