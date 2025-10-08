import { app } from './server';
import { AppDataSource } from './src/data-source';

const port: number = parseInt(process.env.PORT || '3000', 10);

AppDataSource.initialize().then(() => {

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

}).catch((err) => {
    console.error("Init Error", err);
    process.exit(1);
});