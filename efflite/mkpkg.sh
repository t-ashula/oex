PKG=efflite
rm -rf ${PKG}.oex ${PKG}.zip
FILES=$(find ./ -type f | grep -v "mmkpkg.sh" | sed -e's|\./||g' )
echo $FILES
rm -rf ${PKG}.oex && 7z a ${PKG}.zip ${FILES} && mv ${PKG}.zip ${PKG}.oex
