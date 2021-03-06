# Serverless OAuth to Instagram and Firebase


This project is a Serverless implementation of [firebase/custom-auth-samples](https://github.com/firebase/custom-auth-samples/tree/master/instagram).
It provides a cheap and easy way to add an Instagram authentication to your app.

Contributions are welcome.

## Installation

Start by copying the credentials file and installing node modules

```
cp credentials.{default.,}yml
npm install
```

Fill `credentials.yml` with your bucket name, Instagram and Firebase Apps identifiers.

Create your public bucket and synchronize static files into it.

```
aws s3api create-bucket --bucket my-bucket --region eu-west-1
aws s3 sync public/ s3://my-bucket/public/ --acl public-read
```

Get your `service-account.json` file from [Firebase admin setup](https://firebase.google.com/docs/admin/setup).


## Deploy

```
serverless deploy
```

Then, update your [Instagram app](https://www.instagram.com/developer/clients/manage/) with the given instagram-callback endpoint.


## Usage

Open your browser to the provided index endpoint. It should looks like this:
`https://xxx.execute-api.region.amazonaws.com/dev/index`

Click on `Sign In`, authententicate yourself to Instagram and wait for being redirected back to the main page.
A new user should appear in your Firebase Database containing the Instagram token.

## Roadmap

- Mobile deep linking

## Notes

The main page is generated by a Lambda function: it has to be served by the same domain. This is mandatory in order to have the Firebase listener working in the pop-up window.
If you are using a custom domain name, you will then also need to fill `templates/index.html` with the correct Firebase keys.

