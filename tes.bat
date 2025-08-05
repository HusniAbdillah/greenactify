@echo off
echo Generating Splash Screens with logo...

if not exist "public" mkdir public

:: iPhone X/XS/11 Pro (1125x2436) - logo 300px width
magick -size 1125x2436 xc:"#D2E8BB" ( logo-greenactify.png -resize 300x ) -gravity center -composite public/apple-splash-1125-2436.png

:: iPhone 6/7/8 Plus (1242x2208) - logo 320px width  
magick -size 1242x2208 xc:"#D2E8BB" ( logo-greenactify.png -resize 320x ) -gravity center -composite public/apple-splash-1242-2208.png

:: iPhone 6/7/8 (750x1334) - logo 250px width
magick -size 750x1334 xc:"#D2E8BB" ( logo-greenactify.png -resize 250x ) -gravity center -composite public/apple-splash-750-1334.png

:: iPad (1536x2048) - logo 400px width
magick -size 1536x2048 xc:"#D2E8BB" ( logo-greenactify.png -resize 400x ) -gravity center -composite public/apple-splash-1536-2048.png

:: iPad Pro 10.5" (1668x2224) - logo 450px width
magick -size 1668x2224 xc:"#D2E8BB" ( logo-greenactify.png -resize 450x ) -gravity center -composite public/apple-splash-1668-2224.png

:: iPad Pro 12.9" (2048x2732) - logo 500px width
magick -size 2048x2732 xc:"#D2E8BB" ( logo-greenactify.png -resize 500x ) -gravity center -composite public/apple-splash-2048-2732.png

echo ✅ All splash screens generated!
pause