# expo-server
Attempt to load assets and JS libraries to webview from expo app.

https://medium.com/@nik.usichenko/integrating-react-spa-or-static-html-page-into-react-native-with-react-native-static-server-and-d86cf9e3c562

Project must be run in development mode. (npm run ios)

WIP: Android 

Installation errors and solutions:

Cocoapods errors for M1,2,3 macs: You need to use cocoapods version 1.14.3 - 
gem uninstall cocoapods
gem install cocoapods -v 1.14.3

"Xcode must be fully installed before you can continue"
The fix for this was:
`sudo xcode-select -s /Applications/Xcode.app/Contents/Developer``
https://github.com/expo/expo/issues/21727