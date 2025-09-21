import { app } from './server';
import { AppDataSource } from './src/data-source';

const port: number = parseInt(process.env.PORT || '3000', 10);

AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized!");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

}).catch((err) => {
    console.error("Error during Data Source initialization:", err);
    process.exit(1); // Exit if DB connection fails
});