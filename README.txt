Various utils-type classes I have been working on. Most use MooTools Class, but
I may create versions that use something else for a class structure.

Dictionary.js was created to aid in porting ActionScript code to JavaScript when
the ActionScript depended upon Dictionary objects.

disbranded.Cookie tries to window.localStorage but falls back upon
document.cookie.

disbranded.Tween is designed only for instances when a fast tween between
abstract values is needed. It's not designed as a replaced for $.animate() or
anything other standard tween methods. Designed to be with Robert Penner's
original easing equations: http://www.robertpenner.com/easing/

jquery.drag is for quick and dirty drags. Works on touch devices, too, since on
"down" it tests whether the trigger was a touch or a mouse event.

Other classes are hopefully self-explanatory.