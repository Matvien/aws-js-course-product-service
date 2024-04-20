import { initializeDatabaseService } from "./initDatabaseService";

const main = async () => {
  try {
    const dbService = initializeDatabaseService();

    console.log(await dbService.getAllProducts());

    // console.log(
    //   await dbService.getProduct("46fcd9a6-50ff-48f0-8115-1cc277c574ba")
    // );

    // console.log(
    //   await dbService.createProduct({
    //     id: "1q-2w-3e-4r",
    //     title: "one more product",
    //     description: "one more product",
    //     price: 7777,
    //   })
    // );
  } catch (e) {
    console.error("An error occurred:", e);
  }
};

main();
