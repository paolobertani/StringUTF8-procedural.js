## StringUTF8 (procedural style)

&nbsp;

### Work with UTF-8 encoded strings in JavaScript


`version 1.0`

&nbsp;

Two functions to convert UCS2 JavaScript strings to UTF-8 encoded strings and back. Plus a set of function to work with UTF-8 encoded strings.

Avoid the limits and pitfalls of JavaScript native strings.

&nbsp;

### Pitfalls?


`"Foo © bar 𝌆 baz ☃ qux".length` ==> 22, **wrong!**
&nbsp;

`StringUTF8GetLength( StringUTF8FromString( "Foo © bar 𝌆 baz ☃ qux" ) )` ==> 21, **correct!**

&nbsp;

## Functions reference

&nbsp;

`utf8 = StringUTF8FromString( str )`

Takes a JavaScript string and converts it into a UTF-8 encoded string.

The UTF-8 string is returned in the form of an array of integers. Each item of the array represents a single byte of the string.

&nbsp;

--

&nbsp;

`str = StringUTF8ToString( utf8 )`

Takes (an array of integers representing) a UTF-8 string and converts it back to a JavaScript string.

&nbsp;

--

&nbsp;

`copy = StringUTF8Copy( utf8 )`

Returns a copy of the passed UTF-8 string.

&nbsp;

--

&nbsp;

`hex = StringUTF8ToHexString( utf8 )`

Return a string of hex values (2 characters per value) representing the bytes of the passed UTF-8 string:

Example:

```js

utf8 = StringUTF8FromString( "©" );
hex = StringUTF8ToHexString( utf8 );
console.log( hex );
```

gives

`"c2a9"`

Optionally a string can be passed as second argument to specify a prefix to be applied at each value:

`hex = StringUTF8ToHexString( utf8, prefix )`

Example:

```js

utf8 = StringUTF8FromString( "©" );
hex = StringUTF8ToHexString( utf8, "\\x" );
console.log( hex );
```

gives

`"\uc2\ua9"`

&nbsp;

--

&nbsp;

`size = StringUTF8GetCharacterSizeAtByteIndex( utf8, byte_idx )`

Returns the size in bytes of the UTF-8 encoded character at the given byte-index.

If the UTF-8 string is malformed or the byte index `byte_idx` passed does not corrispond to the first byte of a multi-byte character sequence zero `0` is returned.

&nbsp;

--

&nbsp;

`index = StringUTF8GetCharactersIndex( utf8 )`

Returns an array with the indexes of the first byte of every character in the UTF-8 string passed.

Most of UTF-8 string manipulation/inpection algorithms require that is known the byte-index of every character.

The following functions that need that index do built it.

Those functions accept as optional parameter the UTF-8 string index avoiding the need of building it.

If the same UTF-8 string is used multiple times you may consider to build its index with `StringUTF8GetCharactersIndex()` and pass it to subsequent `StringUTF8...` function calls eliminating the need of rebuilding the same index multiple times and thus improving performances.

&nbsp;

--

&nbsp;

`len = StringUTF8GetLength( ut8 )`

`len = StringUTF8GetLength( ut8, index )`

Returns the number of characters of the passed string.

Unless the string contains only ASCII characters the returned value differs from the number of bytes the string is composed of.

To get the number of bytes simply evaluate the length of `utf8` array: `size = utf8.length`

&nbsp;

--

&nbsp;

`size = StringUTF8GetCharacterSizeAtIndex( utf8, chr_idx )`
 
`size = StringUTF8GetCharacterSizeAtIndex( utf8, chr_idx, index )`

Returns the size in bytes of the character at the passed `chr_idx` position.

&nbsp;

--

&nbsp;

`utf8_sub = StringUTF8Substring( utf8, first, count )`

`utf8_sub = StringUTF8Substring( utf8, first, count, index )`

Returns the substring starting from the character position `first` and counting `count` characters.

`count` can be `false` to get the characters up to the end of the string.

The function conforms to the convention used by PHP's `substr()`: `first` can be negative meaning "starting position is *n* character(s) before the end of the string"; `count` can be negative meaning "take all the characters up to the end of the string minus *n*"

&nbsp;

--

&nbsp;

`chr_idx = StringUTF8GetIndexOfSubstring( utf8, substr )`

`chr_idx = StringUTF8GetIndexOfSubstring( utf8, substr, index )`

Returns the character-index (position) of the passed substring `substr`; `-1` is returned if the substring is not found. `substr` can be a UTF-8 string, a string or a number: the function converts it to UTF-8 internally.

&nbsp;

--

&nbsp;

`utf8 = StringUTF8Concat( str1, str2, str3... )`

Returns the UTF-8 resulting of the concatenation of the parameters (UTF-8 strings or strings) passed.

&nbsp;

--

&nbsp;

`utf8_uc = StringUTF8ToUppercase( utf8 )`

Returns a UTF-8 string with all alphabetic characters converted to uppercase.

&nbsp;

--

&nbsp;

`utf8_lc = StringUTF8ToLowercase( utf8 )`
  
Returns a UTF-8 string with all alphabetic characters converted to lowercase.

&nbsp;

--

&nbsp;

## Contact


**<https://www.linkedin.com/in/paolobertani/>** on Linkedin

&nbsp;

## FreeBSD 2-clause license


FreeBSD 2-clause license

Copyright (c) 2022, Paolo Bertani - Kalei S.r.l.

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.



&nbsp;

### Portions of code are taken or derived from:


#### utf8.js - <https://github.com/mathiasbynens/utf8.js>

**A robust JavaScript implementation of a UTF-8 encoder/decoder, as defined by the Encoding Standard.**

**Copyright Mathias Bynens <https://mathiasbynens.be/>**

**Licensed under the MIT License:**

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.













