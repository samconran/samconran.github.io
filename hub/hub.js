let projects = document.getElementsByClassName('project-div');

for (let p of projects)
    p.addEventListener('click', function() {
        window.open(p.attributes.href.value);
    });
