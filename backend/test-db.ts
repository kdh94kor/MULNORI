import { AppDataSource } from './src/data-source';

console.log('DB 연결 step 1 ');
console.log('읽어온 DB_HOST 값:', process.env.DB_HOST);

AppDataSource.initialize()
    .then(() => {
        console.log('성공');
        process.exit(0);
    })
    .catch((error) => {
        console.error('실패', error);
        process.exit(1);
    });
