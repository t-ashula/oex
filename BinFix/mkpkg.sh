PKG=binfix
FILES="config.xml index.html icons/icon.png includes/binfix.js"
rm -rf ${PKG}.oex && 7z a ${PKG}.zip ${FILES} && mv ${PKG}.zip ${PKG}.oex
