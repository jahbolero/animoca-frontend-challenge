This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
$ npm run start
```
## Testing
It is critical that the backend project is running in order to perform testing on the frontend app.

The app was tested end to end to ensure all of the functionalities met the specifications.
## Invite Code System Frontend

This project implements the requirements required in the frontend challenge.
- All endpoints are fully functional and restricts the user-flow until the conditions are met.
- There is a signature verification required in order to prevent spoofing of wallet addresses and prove authentic ownership.
- Referral tracking using 2 tables to associate the code creator and code claimer. The reason this was done is to maintain simplicity while adhering to the requirements.
- Database transaction lock to support concurrent users.

## Future Improvements

- Improve error handling
- Improve UI/UX
- Use viem/wagmi or other more advance Wallet Connect libraries
- Create and seperate code into more components.

