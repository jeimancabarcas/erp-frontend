#### Typography

#### Google fonts

##### 1) Change the google fonts link as per your choice : src/index.html

```html

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@100;200;300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
        />
    </head>

    <body>
    ...
    </body>
</html>


```

##### 2) Change Font family : src/asssets/scss/\_variables.scss

```js

// Font URL
@import url("https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700");

// font
$font-family: "Poppins", sans-serif;


```

##### 3) Change Font family in : src/asssets/scss/override-component/\_theme.scss and src/asssets/scss/themecolors/\*.scss (all files)

```js

// Font Family

@include mat.theme(
  (
    color: mat.$azure-palette,
    typography: "Poppins",
  )
);



```