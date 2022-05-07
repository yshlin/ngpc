function checkIn(accessToken) {
    document.getElementById('gas').src = 'https://script.google.com/macros/s/AKfycbwhzzjSo_nx8st12ZtwB7CxZjMOBiO-Dm3AESLsncGKaViWe-S3rAbm-IluJnWJo9rH/exec?access_token=' + accessToken;
}

function sayHi(profile) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('success').style.display = 'block';
    document.getElementById('user').textContent = profile.name;
}

document.addEventListener("DOMContentLoaded", function () {
    liff.init({liffId: '1657065428-70j9yWX3'})
        .then(() => {
            console.log("Success! you can do something with LIFF API here.")
            if (!liff.isLoggedIn()) {
                liff.login();
            }
            // checkIn(liff.getIDToken());
            checkIn(liff.getAccessToken());
            sayHi(liff.getDecodedIDToken())
        })
        .catch((error) => {
            console.log(error)
        })
});
