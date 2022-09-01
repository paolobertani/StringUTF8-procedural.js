# StringUTF8 (procedural style)

&nbsp;

### Work with UTF-8 encoded strings in JavaScript


`version 1.0`

&nbsp;

Two functions to convert UCS2 JavaScript strings to UTF-8 encoded strings and back, plus a set of function to work with UTF-8 encoded strings.

Avoid the limits and pitfalls of JavaScript native strings.

&nbsp;

### Pitfalls?


`"Foo © bar 𝌆 baz ☃ qux".length` ==> 22, **wrong!**
&nbsp;

`StringUTF8GetLength( StringUTF8FromString( "Foo © bar 𝌆 baz ☃ qux" ) )` ==> 21, **correct!**

&nbsp;

## Functions reference

&nbsp;

**StringUTF8FromString**

`utf8 = StringUTF8FromString( str )`

Returns a UTF-8 encoded string corresponding to the JavaScript string passed.

**Note:**

The UTF-8 string is returned in the form of an **array of integers** where each item represents a single byte of the string.

The functions below never alter UTF-8 string(s) passed as parameter(s); When a UTF-8 string is the return value it is always a new array (never a reference to a existing one).

As UTF-8 strings are arrays they cannot be concatenated using the plus `+` operator, use `StringUTF8Concat` instead (below).

For the same reason they cannot be copied with an assignment `utf8_2 = utf8` that would result in creating a **reference** to the original UTF-8-string/array. To make a copy use `StringUTF8Copy` (below).



## &nbsp;

&nbsp;

**StringUTF8ToString**

`str = StringUTF8ToString( utf8 )`

Returns a native JavaScript (UCS2 encoded) string given the UTF-8 string passed.

## &nbsp;

&nbsp;

**StringUTF8Copy**

`copy = StringUTF8Copy( utf8 )`

Returns a copy of the passed UTF-8 string.

## &nbsp;

&nbsp;

**StringUTF8Compare**

`result = StringUTF8Compare( utf8_1, utf8_2 )`

Returns `true` if the passed UTF-8 strings are equal, `false` otherwise.

## &nbsp;

&nbsp;

**StringUTF8ToHexString**

`hex = StringUTF8ToHexString( utf8 )`

`hex = StringUTF8ToHexString( utf8, prefix )`

Returns a string of hex values (2 characters per value) representing the bytes of the passed UTF-8 string:

Example:

```js

utf8 = StringUTF8FromString( "©" );
hex = StringUTF8ToHexString( utf8 );
console.log( hex );
```

gives

`"c2a9"`

Optionally a string can be passed as second argument to specify a prefix to be applied at each value:

```js

utf8 = StringUTF8FromString( "©" );
hex = StringUTF8ToHexString( utf8, "\\x" );
console.log( hex );
```

gives

`"\uc2\ua9"`

## &nbsp;

&nbsp;

**StringUTF8GetCharactersIndex**

`index = StringUTF8GetCharactersIndex( utf8 )`

Returns an array with the array index of the first byte of every character in the UTF-8 string passed.

**Note:**

Most of the functions that operate on UTF-8 strings need the byte-index of every character (in other words they need the array returned by `StringUTF8GetCharactersIndex`)

Those functions accept as optional parameter the **UTF-8 string index** avoiding the need of building it.

If the same UTF-8 string is used multiple times you may consider to build its index with `StringUTF8GetCharactersIndex` and pass the index to subsequent `StringUTF8...` function calls eliminating the need of rebuilding the same index multiple times and thus improving performance.

## &nbsp;

&nbsp;

**StringUTF8GetLength**

`len = StringUTF8GetLength( ut8 )`

`len = StringUTF8GetLength( ut8, index )`

Returns the **characters** count of the passed UTF-8 string.

To get the number of **bytes** (instead of characters) simply evaluate the length of `utf8` array: `size = utf8.length`

Characters count matches bytes count on strings composed solely by ASCII characters.

Characters above the ASCII range do require from 2 to 4 bytes when encoded to UTF-8.

## &nbsp;

&nbsp;

**StringUTF8GetCharacterSizeAtIndex**

`size = StringUTF8GetCharacterSizeAtIndex( utf8, chr_idx )`
 
`size = StringUTF8GetCharacterSizeAtIndex( utf8, chr_idx, index )`

Returns the size in bytes of the character at position `chr_idx` (first character is located at position zero `0`).

## &nbsp;

&nbsp;

**StringUTF8GetCharacterSizeAtByteIndex**

`size = StringUTF8GetCharacterSizeAtByteIndex( utf8, byte_idx )`

Returns the size in bytes of the UTF-8 encoded character at the given **byte-index** (first byte is located at byte index zero `0`).

If the UTF-8 string is malformed or the byte index `byte_idx` passed does not correspond to the first byte of a multi-byte character sequence then zero `0` is returned.

## &nbsp;

&nbsp;

**StringUTF8Substring**

`utf8_sub = StringUTF8Substring( utf8, first, count )`

`utf8_sub = StringUTF8Substring( utf8, first, count, index )`

Returns the substring starting from the character position `first` and counting `count` characters.

`count` can be `false` to get the characters up to the end of the string.

The function conforms to the convention used by PHP's `substr()`: `first` can be negative meaning "starting position is *n* character(s) before the end of the string"; `count` can be negative meaning "take all the characters up to the end of the string minus *n*"

## &nbsp;

&nbsp;

**StringUTF8GetIndexOfSubstring**

`chr_idx = StringUTF8GetIndexOfSubstring( utf8, substr )`

`chr_idx = StringUTF8GetIndexOfSubstring( utf8, substr, offset )`

`chr_idx = StringUTF8GetIndexOfSubstring( utf8, substr, offset, index )`

Returns the character-index (position) of the passed substring `substr`; `-1` is returned if the substring is not found. `substr` can be a UTF-8 string, a string or a number: the function converts it to UTF-8 internally.

Optionally `offset` can be passed to begin the search from the specified character index.

## &nbsp;

&nbsp;

**StringUTF8Replace**

`utf8_rep = StringUTF8Replace( utf8, find, replace )`

`utf8_rep = StringUTF8Replace( utf8, find, replace, index )`

Returns the UTF-8 string obtained replacing `find` with `replace`.

`find` and `replace` can be UTF-8 strings, strings or numbers. If passed as string or number they get converted to UTF-8.

## &nbsp;

&nbsp;

**StringUTF8Trim**

`utf8_trimmed = StringUTF8Trim( utf8 )`

`utf8_trimmed = StringUTF8Trim( utf8, trim )`

`utf8_trimmed = StringUTF8Trim( utf8, trim, index )`

Returns the UTF-8 string obtained removing tabs `\t`, newlines `\n`, carriage returns `\r` and spaces from the beginning and the end of the string.

`trim` con be optionally specified (as string or UTF-8 string) to specify the single characters to trim (default: "\n\r\t ").

## &nbsp;

&nbsp;

**StringUTF8Concat**

`utf8 = StringUTF8Concat( str1, str2, str3... )`

Returns the UTF-8 string resulting of the concatenation of the parameters (UTF-8 strings or strings) passed.

## &nbsp;

&nbsp;

**StringUTF8ToUppercase**

`utf8_uc = StringUTF8ToUppercase( utf8 )`

Returns a UTF-8 string with all alphabetic characters converted to uppercase.

## &nbsp;

&nbsp;

**StringUTF8ToLowercase**

`utf8_lc = StringUTF8ToLowercase( utf8 )`
  
Returns a UTF-8 string with all alphabetic characters converted to lowercase.

## &nbsp;

&nbsp;

## Contact


**<https://www.linkedin.com/in/paolobertani/>** on Linkedin

&nbsp;

## FreeBSD 2-clause license


Copyright © 2022, Paolo Bertani - Kalei S.r.l.

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













