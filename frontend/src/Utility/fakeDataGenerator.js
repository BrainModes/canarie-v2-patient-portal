const faker = require('faker');

export default function fakeDataGenerator(num){
    const result = [];
    for(let i=0;i<num;i++){
        const item = {
            name: faker.name.findName(),
            email:faker.internet.email(),
            date: faker.date.recent(),
        };
        result.push(item)
    }
    return result;
}