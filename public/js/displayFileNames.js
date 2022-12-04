function previewMultiple(event) {
    const form = document.querySelector('#formFile');
    form.innerHTML = "";
    const images = document.getElementById("image");
    for (i = 0; i < images.files.length; i++) {
        const urls = URL.createObjectURL(event.target.files[i]);
        form.innerHTML += `<img src= ${urls} >`;
    }
}