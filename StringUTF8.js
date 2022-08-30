//
// FreeBSD 2-clause license
//
// StringUTF8.js (procedural style)
//
// Two functions to convert UCS2 JavaScript strings to UTF-8 encoded strings and back.
// Plus a set of function to work with UTF-8 encoded strings.
// UTF-8 Encoded strings are stored as array of unsigned bytes.
//
// version 1.0
//
// Copyright (c) 2022, Paolo Bertani - Kalei S.r.l.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//
// Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the distribution.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
// BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
// OR CONSEQUENTIAL DAMAGES ( INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION ) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// ( INCLUDING NEGLIGENCE OR OTHERWISE ) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//






//
//  - SECTION 1 -
//
// Convert string from JavaScript USC2 native encoding to UTF-8
// Execute the conversion back from UTF-8 to UCS2
// Fail silently returning a empty array in case of invalid encoding
//



// Portions of code in this section are taken or derived from:
//
// utf8.js - https://github.com/mathiasbynens/utf8.js
//
// A robust JavaScript implementation of a UTF-8 encoder/decoder, as defined by the Encoding Standard.
//
// Copyright Mathias Bynens <https://mathiasbynens.be/>
//
// Licensed under the MIT-License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



//
// Convert JavaScript UCS2 string to UTF-8 string
//

/*jshint bitwise: false*/

function StringUTF8FromString( str )
{
    var codePoints,
        len,
        index,
        codePoint,
        utf8,
         counter,
        value,
        extra;


    // translate UCS2 into codePoints

    codePoints = [];
    counter = 0;
    len = str.length;

    while( counter < len )
    {
        value = str.charCodeAt( counter++ );
        if( value >= 0xD800 && value <= 0xDBFF && counter < len ) // high surrogate, and there is a next character
        {
            extra = str.charCodeAt( counter++ );
            if( ( extra & 0xFC00 ) === 0xDC00 ) // low surrogate
            {
                codePoints.push( ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 );
            }
            else // unmatched surrogate; only append this code unit, in case the next
            {    // code unit is the high surrogate of a surrogate pair
                codePoints.push( value );
                counter--;
            }
        }
        else
        {
            codePoints.push( value );
        }
    }


    // convert codePoints to UTF-8

    len = codePoints.length;
    utf8 = [];

    for( index = 0; index < len; index++ )
    {
        codePoint = codePoints[ index ];


        // encode codePoint

        if( ( codePoint & 0xFFFFFF80 ) == 0 ) // 1-byte sequence
        {
            utf8.push( codePoint );
        }
        else
        {
            if( ( codePoint & 0xFFFFF800 ) == 0 ) // 2-byte sequence
            {
                utf8.push( ( ( codePoint >> 6 ) & 0x1F ) | 0xC0 );
            }
            else if( ( codePoint & 0xFFFF0000 ) == 0 ) // 3-byte sequence
            {
                if( codePoint >= 0xD800 && codePoint <= 0xDFFF )
                {
                    return []; // EXCEPTION
                }
                utf8.push( ( ( codePoint >> 12 ) & 0x0F ) | 0xE0 );
                utf8.push( ( ( codePoint >> 6  ) & 0x3F ) | 0x80);
            }
            else if( ( codePoint & 0xFFE00000 ) == 0 ) // 4-byte sequence
            {
                utf8.push( ( ( codePoint >> 18 ) & 0x07 ) | 0xF0 );
                utf8.push( ( ( codePoint >> 12 ) & 0x3F ) | 0x80 );
                utf8.push( ( ( codePoint >> 6  ) & 0x3F ) | 0x80 );
            }

            utf8.push( ( codePoint & 0x3F ) | 0x80 );
        }

    }

    return utf8;
}



//
// Convert UTF8 string to JavaScript UCS2 string
//

function StringUTF8ToString( utf8 )
{
    var byteCount,
        byteIndex,
        index,
        len,
        value,
        codePoints,
        continuationByte,
        byte1,
        byte2,
        byte3,
        byte4,
        codePoint,
        str;


    codePoints = [];
    byteCount = utf8.length;
    byteIndex = 0;

    while( true )
    {
        if( byteIndex > byteCount )
        {
            return ""; // EXCEPTION
        }

        if( byteIndex === byteCount )
        {
            break;
        }

        // Read first byte

        byte1 = utf8[byteIndex] & 0xFF;
        byteIndex++;

        if( ( byte1 & 0x80 ) == 0 ) // 1-byte sequence ( no continuation bytes )
        {
            codePoint = byte1;
        }
        else if( ( byte1 & 0xE0 ) == 0xC0 ) // 2-byte sequence
        {
            if( byteIndex >= byteCount )
            {
                return ""; // Invalid byte index
            }

            continuationByte = utf8[ byteIndex ] & 0xFF;
            byteIndex++;
            if( ( continuationByte & 0xC0 ) == 0x80 )
            {
                continuationByte = continuationByte & 0x3F;
            }
            else
            {
                return ""; // Invalid continuation byte
            }
            byte2 = continuationByte;


            codePoint = ( ( byte1 & 0x1F ) << 6 ) | byte2;
            if( codePoint >= 0x80 )
            {
                // ok
            }
            else
            {
                return ""; //Invalid continuation byte
            }
        }
        else if( ( byte1 & 0xF0 ) == 0xE0 ) // 3-byte sequence ( may include unpaired surrogates )
        {
            continuationByte = utf8[ byteIndex ] & 0xFF;
            byteIndex++;
            if( ( continuationByte & 0xC0 ) == 0x80 )
            {
                continuationByte = continuationByte & 0x3F;
            }
            else
            {
                return ""; // Invalid continuation byte
            }
            byte2 = continuationByte;

            continuationByte = utf8[ byteIndex ] & 0xFF;
            byteIndex++;
            if( ( continuationByte & 0xC0 ) == 0x80 )
            {
                continuationByte = continuationByte & 0x3F;
            }
            else
            {
                return ""; // Invalid continuation byte
            }
            byte3 = continuationByte;

            codePoint = ( ( byte1 & 0x0F ) << 12 ) | ( byte2 << 6 ) | byte3;

            if( codePoint >= 0x0800 )
            {
                if(codePoint >= 0xD800 && codePoint <= 0xDFFF )
                {
                    return ""; // Lone surrogate is not scalar value
                }
            }
            else
            {
                return ""; // Invalid continuation byte
            }
        }
        else if( ( byte1 & 0xF8 ) == 0xF0 ) // 4-byte sequence
        {
            continuationByte = utf8[ byteIndex ] & 0xFF;
            byteIndex++;
            if( ( continuationByte & 0xC0 ) == 0x80 )
            {
                continuationByte = continuationByte & 0x3F;
            }
            else
            {
                return ""; // Invalid continuation byte
            }
            byte2 = continuationByte;

            continuationByte = utf8[ byteIndex ] & 0xFF;
            byteIndex++;
            if( ( continuationByte & 0xC0 ) == 0x80 )
            {
                continuationByte = continuationByte & 0x3F;
            }
            else
            {
                return ""; // Invalid continuation byte
            }
            byte3 = continuationByte;

            continuationByte = utf8[ byteIndex ] & 0xFF;
            byteIndex++;
            if( ( continuationByte & 0xC0 ) == 0x80 )
            {
                continuationByte = continuationByte & 0x3F;
            }
            else
            {
                return ""; // Invalid continuation byte
            }
            byte4 = continuationByte;

            codePoint = ( ( byte1 & 0x07 ) << 0x12 ) | ( byte2 << 0x0C ) | ( byte3 << 0x06 ) | byte4;
            if( codePoint >= 0x010000 && codePoint <= 0x10FFFF )
            {
                // ok
            }
            else
            {
                return ""; // EXCEPTION
            }
        }

        codePoints.push( codePoint );
    }


    // encode codePoints into UCS2

    str = '';
    len = codePoints.length;
    for( index = 0; index < len; index++ )
    {
        value = codePoints[ index ];
        if( value > 0xFFFF )
        {
            value -= 0x10000;
            str += String.fromCharCode( value >>> 10 & 0x3FF | 0xD800 );
            value = 0xDC00 | value & 0x3FF;
        }
        str += String.fromCharCode(value);
    }

    return str;
}






//
// - Section 2 -
//
// Work with UTF-8 encoded strings
//



//
// Return a copy of the UTF-8 string
//


function StringUTF8Copy( str )
{
    var out;

    out = str.slice();

    return out;
}



//
// Return a hex values string representing the bytes of a UTF-8 encoded string
//

function StringUTF8ToHexString( s, prefix /* optional, default: '' */ )
{
    var i,l,o,v;

    if( typeof( prefix ) === 'undefined' ) prefix = ''; // eventually may be `\x` or `%`

    l = s.length;
    o = '';

    for( i = 0; i < l; i++ )
    {
        v = s[ i ];
        if( v > 0xFF )
        {
            return ""; // string is not UTF-8 encoded
        }
        o += prefix + v.toString( 16 );
    }

    return o;
}



//
// Get the size in bytes of the UTF-8 encoded character at the given byte-index
//

function StringUTF8GetCharacterSizeAtByteIndex( s, i )
{
    var l;

    l = s.length;

    if( i < 0 || i >= l ) return 0;

         if( i <= l - 4 && ( s[ i ] & 0xf8 ) === 0xf0 && ( s[ i + 1 ] & 0xc0 ) === 0x80 && ( s[ i + 2 ] & 0xc0 ) === 0x80 && ( s[ i + 3 ] & 0xc0 ) === 0x80 ) return 4;
    else if( i <= l - 3 && ( s[ i ] & 0xf0 ) === 0xe0 && ( s[ i + 1 ] & 0xc0 ) === 0x80 && ( s[ i + 2 ] & 0xc0 ) === 0x80 ) return 3;
    else if( i <= l - 2 && ( s[ i ] & 0xe0 ) === 0xc0 && ( s[ i + 1 ] & 0xc0 ) === 0x80 ) return 2;
    else if( i <= l - 1 && ( s[ i ] & 0x80 ) === 0x00 ) return 1;
    else return 0; // EXCEPTION
}



//
// Note:
//
//  most of the the work with UTF-8 encoded strings is evaluating the size in bytes of every character
//  and evaluating the string byte-index for a character with given character-index;
//  This is due to the simple fact that a character UTF-8 encoded may take from 1 to 4 bytes.
//
//  A specific function `StringUTF8GetCharactersIndex()` builds an array that serves as index:
//  for every character of the UTF-8 encoded string the index position in the array is given.
//
//  Example:
//
//  ucs2 = "Foo © bar 𝌆 baz ☃ qux";             // "Foo © bar 𝌆 baz ☃ qux"
//
//      ** note that js is already showing its limit: ucs2.length returns wrongly 22, because
//         `𝌆` expands to two UCS2 surrogates despite being a single character; the correct
//         length is 21 characters.
//
//  utf8 = StringUTF8FromString( ucs2 );        // [ 0x46, 0x6f, 0x6f, 0x20, 0xc2, 0xa9, 0x20, 0x62, 0x61, 0x72, 0x20, 0xf0, 0x9d, 0x8c, 0x86, 0x20, 0x62, 0x61, 0x7a, 0x20, 0xe2, 0x98, 0x83, 0x20, 0x71, 0x75, 0x78 ]
//
//  indx = StringUTF8GetCharactersIndex( utf8 );// [ 0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 23, 24, 25, 26 ]
//                                                   F  o  o     ©     b  a  r      𝌆       b   a   z       ☃       q   u   x
//
//  Every function that needs the index to perform its task accepts it as optional parameter, in order to avoid
//  the need of rebuilding it each time for the same string. If performance is not an issue, omitting the index will let the
//  function build it on demand.
//



//
// Build an array with the index of every character in the UTF8 string
//

function StringUTF8GetCharactersIndex( s )
{
    var idx,l,i;

    l = s.length;

    idx = [];

    for( i = 0; i < l; )
    {
        idx.push( i );

             if( i <= l - 4 && ( s[ i ] & 0xf8 ) === 0xf0 && ( s[ i + 1 ] & 0xc0 ) === 0x80 && ( s[ i + 2 ] & 0xc0 ) === 0x80 && ( s[ i + 3 ] & 0xc0 ) === 0x80 ) i += 4;
        else if( i <= l - 3 && ( s[ i ] & 0xf0 ) === 0xe0 && ( s[ i + 1 ] & 0xc0 ) === 0x80 && ( s[ i + 2 ] & 0xc0 ) === 0x80 ) i += 3;
        else if( i <= l - 2 && ( s[ i ] & 0xe0 ) === 0xc0 && ( s[ i + 1 ] & 0xc0 ) === 0x80 ) i += 2;
        else if( i <= l - 1 && ( s[ i ] & 0x80 ) === 0x00 ) i++;
        else return []; // EXCEPTION
    }

    return idx;
}



//
// Returns the number of characters of the string
//

function StringUTF8GetLength( s, idx )
{
    if( typeof( idx ) === 'undefined' ) idx = StringUTF8GetCharactersIndex( s );

    return idx.length;
}



//
// Get the size in bytes of the UTF-8 encoded character at the given index
//

function StringUTF8GetCharacterSizeAtIndex( s, i, idx )
{
    if( typeof( idx ) === 'undefined' ) idx = StringUTF8GetCharactersIndex( s );

    if( i < 0 || i >= idx.length ) return 0;

    return StringUTF8GetCharacterSizeAtByteIndex( s, idx[ i ] );
}



//
// Get a substring given index and characters count; let count be `false` to get the characters up to the end of the string
//
// As per PHP's substr() flavour, `first` can be negative meaning start `n` character(s) before the end of the string;
// `count` can be negative meaning take all the characters up to the end of the string minus `n`
//

function StringUTF8Substring( str, first, count, idx )
{
    var len,last,sub,i;

    if( typeof( idx ) === 'undefined' ) idx = StringUTF8GetCharactersIndex( str );

    len = idx.length;

    if( first < 0 )
    {
        first = ( len + first ) < 0 ? 0 : ( len + first );
    }

    if( count === false )
    {
        last = len - 1;
    }
    else
    {
        last = count > 0 ? ( first + count - 1 ) : ( len + count - 1 );
    }

    if( last < first ) return [];

    if( last > len - 1 ) last = len - 1;

    first = idx[ first ];
    last = last === ( len - 1 ) ? str.length : idx[ last + 1 ];

    sub = [];
    for( i = first; i < last; i++ )
    {
        sub.push( str[ i ] );
    }
    return sub;
}



//
// Get index of UTF8 substring in UTF8 string; return -1 if substring is not found
//

function StringUTF8GetIndexOfSubstring( str, sub, idx )
{
    var i,
        j,
        found,
        strsize,
        subsize,
        idxlen;

    strsize = str.length;
    subsize = sub.length;

    if( strsize === 0 || subsize === 0 || subsize > strsize )
    {
        return -1;
    }

    strsize -= subsize;

    for( i = 0; i < strsize; i++ )
    {
        found = true;
        for( j = 0; j < subsize; j++ )
        {
            if( str[ i + j ] !== sub[ j ] )
            {
                found = false;
                break;
            }
        }

        if( found )
        {
            break;
        }
    }

    if( ! found )
    {
        return -1;
    }

    if( typeof( idx ) === 'undefined' ) idx = StringUTF8GetCharactersIndex( str );

    idxlen = idx.length;

    for( j = 0; j < idxlen; j++ )
    {
        if( idx[ j ] === i )
        {
            return j;
        }
    }

    return -1;
}



//
// Join strings
//

function StringUTF8Concat( /* str1, str2, str3... */ )
{
    var i,n,out,u8;

    n = arguments.length;

    out = [];

    if( n === 0 ) return out;

    for( i = 0; i < n; i++ )
    {
        u8 = arguments[ i ];
        if( typeof( u8 ) === 'string' )
        {
            u8 = StringUTF8FromString( u8 );
        }

        out.push.apply( out, u8 );
    }

    return out;
}



//
// Turn the string uppercase
//

function StringUTF8ToUppercase( str )
{
    var cc = [];

    // Lowercase to uppercase

    cc[0x61] = 0x41;                cc[0x62] = 0x42;                cc[0x63] = 0x43;                cc[0x64] = 0x44;
    cc[0x65] = 0x45;                cc[0x66] = 0x46;                cc[0x67] = 0x47;                cc[0x68] = 0x48;
    cc[0x69] = 0x49;                cc[0x6a] = 0x4a;                cc[0x6b] = 0x4b;                cc[0x6c] = 0x4c;
    cc[0x6d] = 0x4d;                cc[0x6e] = 0x4e;                cc[0x6f] = 0x4f;                cc[0x70] = 0x50;
    cc[0x71] = 0x51;                cc[0x72] = 0x52;                cc[0x73] = 0x53;                cc[0x74] = 0x54;
    cc[0x75] = 0x55;                cc[0x76] = 0x56;                cc[0x77] = 0x57;                cc[0x78] = 0x58;
    cc[0x79] = 0x59;                cc[0x7a] = 0x5a;                cc[0xc2b5] = 0xce9c;            cc[0xc39f] = 0x5353;
    cc[0xc3a0] = 0xc380;            cc[0xc3a1] = 0xc381;            cc[0xc3a2] = 0xc382;            cc[0xc3a3] = 0xc383;
    cc[0xc3a4] = 0xc384;            cc[0xc3a5] = 0xc385;            cc[0xc3a6] = 0xc386;            cc[0xc3a7] = 0xc387;
    cc[0xc3a8] = 0xc388;            cc[0xc3a9] = 0xc389;            cc[0xc3aa] = 0xc38a;            cc[0xc3ab] = 0xc38b;
    cc[0xc3ac] = 0xc38c;            cc[0xc3ad] = 0xc38d;            cc[0xc3ae] = 0xc38e;            cc[0xc3af] = 0xc38f;
    cc[0xc3b0] = 0xc390;            cc[0xc3b1] = 0xc391;            cc[0xc3b2] = 0xc392;            cc[0xc3b3] = 0xc393;
    cc[0xc3b4] = 0xc394;            cc[0xc3b5] = 0xc395;            cc[0xc3b6] = 0xc396;            cc[0xc3b8] = 0xc398;
    cc[0xc3b9] = 0xc399;            cc[0xc3ba] = 0xc39a;            cc[0xc3bb] = 0xc39b;            cc[0xc3bc] = 0xc39c;
    cc[0xc3bd] = 0xc39d;            cc[0xc3be] = 0xc39e;            cc[0xc3bf] = 0xc5b8;            cc[0xc481] = 0xc480;
    cc[0xc483] = 0xc482;            cc[0xc485] = 0xc484;            cc[0xc487] = 0xc486;            cc[0xc489] = 0xc488;
    cc[0xc48b] = 0xc48a;            cc[0xc48d] = 0xc48c;            cc[0xc48f] = 0xc48e;            cc[0xc491] = 0xc490;
    cc[0xc493] = 0xc492;            cc[0xc495] = 0xc494;            cc[0xc497] = 0xc496;            cc[0xc499] = 0xc498;
    cc[0xc49b] = 0xc49a;            cc[0xc49d] = 0xc49c;            cc[0xc49f] = 0xc49e;            cc[0xc4a1] = 0xc4a0;
    cc[0xc4a3] = 0xc4a2;            cc[0xc4a5] = 0xc4a4;            cc[0xc4a7] = 0xc4a6;            cc[0xc4a9] = 0xc4a8;
    cc[0xc4ab] = 0xc4aa;            cc[0xc4ad] = 0xc4ac;            cc[0xc4af] = 0xc4ae;            cc[0xc4b1] = 0x49;
    cc[0xc4b3] = 0xc4b2;            cc[0xc4b5] = 0xc4b4;            cc[0xc4b7] = 0xc4b6;            cc[0xc4ba] = 0xc4b9;
    cc[0xc4bc] = 0xc4bb;            cc[0xc4be] = 0xc4bd;            cc[0xc580] = 0xc4bf;            cc[0xc582] = 0xc581;
    cc[0xc584] = 0xc583;            cc[0xc586] = 0xc585;            cc[0xc588] = 0xc587;            cc[0xc589] = 0xcabc4e;
    cc[0xc58b] = 0xc58a;            cc[0xc58d] = 0xc58c;            cc[0xc58f] = 0xc58e;            cc[0xc591] = 0xc590;
    cc[0xc593] = 0xc592;            cc[0xc595] = 0xc594;            cc[0xc597] = 0xc596;            cc[0xc599] = 0xc598;
    cc[0xc59b] = 0xc59a;            cc[0xc59d] = 0xc59c;            cc[0xc59f] = 0xc59e;            cc[0xc5a1] = 0xc5a0;
    cc[0xc5a3] = 0xc5a2;            cc[0xc5a5] = 0xc5a4;            cc[0xc5a7] = 0xc5a6;            cc[0xc5a9] = 0xc5a8;
    cc[0xc5ab] = 0xc5aa;            cc[0xc5ad] = 0xc5ac;            cc[0xc5af] = 0xc5ae;            cc[0xc5b1] = 0xc5b0;
    cc[0xc5b3] = 0xc5b2;            cc[0xc5b5] = 0xc5b4;            cc[0xc5b7] = 0xc5b6;            cc[0xc5ba] = 0xc5b9;
    cc[0xc5bc] = 0xc5bb;            cc[0xc5be] = 0xc5bd;            cc[0xc5bf] = 0x53;              cc[0xc680] = 0xc983;
    cc[0xc683] = 0xc682;            cc[0xc685] = 0xc684;            cc[0xc688] = 0xc687;            cc[0xc68c] = 0xc68b;
    cc[0xc692] = 0xc691;            cc[0xc695] = 0xc7b6;            cc[0xc699] = 0xc698;            cc[0xc69a] = 0xc8bd;
    cc[0xc69e] = 0xc8a0;            cc[0xc6a1] = 0xc6a0;            cc[0xc6a3] = 0xc6a2;            cc[0xc6a5] = 0xc6a4;
    cc[0xc6a8] = 0xc6a7;            cc[0xc6ad] = 0xc6ac;            cc[0xc6b0] = 0xc6af;            cc[0xc6b4] = 0xc6b3;
    cc[0xc6b6] = 0xc6b5;            cc[0xc6b9] = 0xc6b8;            cc[0xc6bd] = 0xc6bc;            cc[0xc6bf] = 0xc7b7;
    cc[0xc785] = 0xc784;            cc[0xc786] = 0xc784;            cc[0xc788] = 0xc787;            cc[0xc789] = 0xc787;
    cc[0xc78b] = 0xc78a;            cc[0xc78c] = 0xc78a;            cc[0xc78e] = 0xc78d;            cc[0xc790] = 0xc78f;
    cc[0xc792] = 0xc791;            cc[0xc794] = 0xc793;            cc[0xc796] = 0xc795;            cc[0xc798] = 0xc797;
    cc[0xc79a] = 0xc799;            cc[0xc79c] = 0xc79b;            cc[0xc79d] = 0xc68e;            cc[0xc79f] = 0xc79e;
    cc[0xc7a1] = 0xc7a0;            cc[0xc7a3] = 0xc7a2;            cc[0xc7a5] = 0xc7a4;            cc[0xc7a7] = 0xc7a6;
    cc[0xc7a9] = 0xc7a8;            cc[0xc7ab] = 0xc7aa;            cc[0xc7ad] = 0xc7ac;            cc[0xc7af] = 0xc7ae;
    cc[0xc7b0] = 0x4acc8c;          cc[0xc7b2] = 0xc7b1;            cc[0xc7b3] = 0xc7b1;            cc[0xc7b5] = 0xc7b4;
    cc[0xc7b9] = 0xc7b8;            cc[0xc7bb] = 0xc7ba;            cc[0xc7bd] = 0xc7bc;            cc[0xc7bf] = 0xc7be;
    cc[0xc881] = 0xc880;            cc[0xc883] = 0xc882;            cc[0xc885] = 0xc884;            cc[0xc887] = 0xc886;
    cc[0xc889] = 0xc888;            cc[0xc88b] = 0xc88a;            cc[0xc88d] = 0xc88c;            cc[0xc88f] = 0xc88e;
    cc[0xc891] = 0xc890;            cc[0xc893] = 0xc892;            cc[0xc895] = 0xc894;            cc[0xc897] = 0xc896;
    cc[0xc899] = 0xc898;            cc[0xc89b] = 0xc89a;            cc[0xc89d] = 0xc89c;            cc[0xc89f] = 0xc89e;
    cc[0xc8a3] = 0xc8a2;            cc[0xc8a5] = 0xc8a4;            cc[0xc8a7] = 0xc8a6;            cc[0xc8a9] = 0xc8a8;
    cc[0xc8ab] = 0xc8aa;            cc[0xc8ad] = 0xc8ac;            cc[0xc8af] = 0xc8ae;            cc[0xc8b1] = 0xc8b0;
    cc[0xc8b3] = 0xc8b2;            cc[0xc8bc] = 0xc8bb;            cc[0xc8bf] = 0xe2b1be;          cc[0xc980] = 0xe2b1bf;
    cc[0xc982] = 0xc981;            cc[0xc987] = 0xc986;            cc[0xc989] = 0xc988;            cc[0xc98b] = 0xc98a;
    cc[0xc98d] = 0xc98c;            cc[0xc98f] = 0xc98e;            cc[0xc990] = 0xe2b1af;          cc[0xc991] = 0xe2b1ad;
    cc[0xc992] = 0xe2b1b0;          cc[0xc993] = 0xc681;            cc[0xc994] = 0xc686;            cc[0xc996] = 0xc689;
    cc[0xc997] = 0xc68a;            cc[0xc999] = 0xc68f;            cc[0xc99b] = 0xc690;            cc[0xc99c] = 0xea9eab;
    cc[0xc9a0] = 0xc693;            cc[0xc9a1] = 0xea9eac;          cc[0xc9a3] = 0xc694;            cc[0xc9a5] = 0xea9e8d;
    cc[0xc9a6] = 0xea9eaa;          cc[0xc9a8] = 0xc697;            cc[0xc9a9] = 0xc696;            cc[0xc9aa] = 0xea9eae;
    cc[0xc9ab] = 0xe2b1a2;          cc[0xc9ac] = 0xea9ead;          cc[0xc9af] = 0xc69c;            cc[0xc9b1] = 0xe2b1ae;
    cc[0xc9b2] = 0xc69d;            cc[0xc9b5] = 0xc69f;            cc[0xc9bd] = 0xe2b1a4;          cc[0xca80] = 0xc6a6;
    cc[0xca82] = 0xea9f85;          cc[0xca83] = 0xc6a9;            cc[0xca87] = 0xea9eb1;          cc[0xca88] = 0xc6ae;
    cc[0xca89] = 0xc984;            cc[0xca8a] = 0xc6b1;            cc[0xca8b] = 0xc6b2;            cc[0xca8c] = 0xc985;
    cc[0xca92] = 0xc6b7;            cc[0xca9d] = 0xea9eb2;          cc[0xca9e] = 0xea9eb0;          cc[0xcd85] = 0xce99;
    cc[0xcdb1] = 0xcdb0;            cc[0xcdb3] = 0xcdb2;            cc[0xcdb7] = 0xcdb6;            cc[0xcdbb] = 0xcfbd;
    cc[0xcdbc] = 0xcfbe;            cc[0xcdbd] = 0xcfbf;            cc[0xce90] = 0xce99cc88cc81;    cc[0xceac] = 0xce86;
    cc[0xcead] = 0xce88;            cc[0xceae] = 0xce89;            cc[0xceaf] = 0xce8a;            cc[0xceb0] = 0xcea5cc88cc81;
    cc[0xceb1] = 0xce91;            cc[0xceb2] = 0xce92;            cc[0xceb3] = 0xce93;            cc[0xceb4] = 0xce94;
    cc[0xceb5] = 0xce95;            cc[0xceb6] = 0xce96;            cc[0xceb7] = 0xce97;            cc[0xceb8] = 0xce98;
    cc[0xceb9] = 0xce99;            cc[0xceba] = 0xce9a;            cc[0xcebb] = 0xce9b;            cc[0xcebc] = 0xce9c;
    cc[0xcebd] = 0xce9d;            cc[0xcebe] = 0xce9e;            cc[0xcebf] = 0xce9f;            cc[0xcf80] = 0xcea0;
    cc[0xcf81] = 0xcea1;            cc[0xcf82] = 0xcea3;            cc[0xcf83] = 0xcea3;            cc[0xcf84] = 0xcea4;
    cc[0xcf85] = 0xcea5;            cc[0xcf86] = 0xcea6;            cc[0xcf87] = 0xcea7;            cc[0xcf88] = 0xcea8;
    cc[0xcf89] = 0xcea9;            cc[0xcf8a] = 0xceaa;            cc[0xcf8b] = 0xceab;            cc[0xcf8c] = 0xce8c;
    cc[0xcf8d] = 0xce8e;            cc[0xcf8e] = 0xce8f;            cc[0xcf90] = 0xce92;            cc[0xcf91] = 0xce98;
    cc[0xcf95] = 0xcea6;            cc[0xcf96] = 0xcea0;            cc[0xcf97] = 0xcf8f;            cc[0xcf99] = 0xcf98;
    cc[0xcf9b] = 0xcf9a;            cc[0xcf9d] = 0xcf9c;            cc[0xcf9f] = 0xcf9e;            cc[0xcfa1] = 0xcfa0;
    cc[0xcfa3] = 0xcfa2;            cc[0xcfa5] = 0xcfa4;            cc[0xcfa7] = 0xcfa6;            cc[0xcfa9] = 0xcfa8;
    cc[0xcfab] = 0xcfaa;            cc[0xcfad] = 0xcfac;            cc[0xcfaf] = 0xcfae;            cc[0xcfb0] = 0xce9a;
    cc[0xcfb1] = 0xcea1;            cc[0xcfb2] = 0xcfb9;            cc[0xcfb3] = 0xcdbf;            cc[0xcfb5] = 0xce95;
    cc[0xcfb8] = 0xcfb7;            cc[0xcfbb] = 0xcfba;            cc[0xd0b0] = 0xd090;            cc[0xd0b1] = 0xd091;
    cc[0xd0b2] = 0xd092;            cc[0xd0b3] = 0xd093;            cc[0xd0b4] = 0xd094;            cc[0xd0b5] = 0xd095;
    cc[0xd0b6] = 0xd096;            cc[0xd0b7] = 0xd097;            cc[0xd0b8] = 0xd098;            cc[0xd0b9] = 0xd099;
    cc[0xd0ba] = 0xd09a;            cc[0xd0bb] = 0xd09b;            cc[0xd0bc] = 0xd09c;            cc[0xd0bd] = 0xd09d;
    cc[0xd0be] = 0xd09e;            cc[0xd0bf] = 0xd09f;            cc[0xd180] = 0xd0a0;            cc[0xd181] = 0xd0a1;
    cc[0xd182] = 0xd0a2;            cc[0xd183] = 0xd0a3;            cc[0xd184] = 0xd0a4;            cc[0xd185] = 0xd0a5;
    cc[0xd186] = 0xd0a6;            cc[0xd187] = 0xd0a7;            cc[0xd188] = 0xd0a8;            cc[0xd189] = 0xd0a9;
    cc[0xd18a] = 0xd0aa;            cc[0xd18b] = 0xd0ab;            cc[0xd18c] = 0xd0ac;            cc[0xd18d] = 0xd0ad;
    cc[0xd18e] = 0xd0ae;            cc[0xd18f] = 0xd0af;            cc[0xd190] = 0xd080;            cc[0xd191] = 0xd081;
    cc[0xd192] = 0xd082;            cc[0xd193] = 0xd083;            cc[0xd194] = 0xd084;            cc[0xd195] = 0xd085;
    cc[0xd196] = 0xd086;            cc[0xd197] = 0xd087;            cc[0xd198] = 0xd088;            cc[0xd199] = 0xd089;
    cc[0xd19a] = 0xd08a;            cc[0xd19b] = 0xd08b;            cc[0xd19c] = 0xd08c;            cc[0xd19d] = 0xd08d;
    cc[0xd19e] = 0xd08e;            cc[0xd19f] = 0xd08f;            cc[0xd1a1] = 0xd1a0;            cc[0xd1a3] = 0xd1a2;
    cc[0xd1a5] = 0xd1a4;            cc[0xd1a7] = 0xd1a6;            cc[0xd1a9] = 0xd1a8;            cc[0xd1ab] = 0xd1aa;
    cc[0xd1ad] = 0xd1ac;            cc[0xd1af] = 0xd1ae;            cc[0xd1b1] = 0xd1b0;            cc[0xd1b3] = 0xd1b2;
    cc[0xd1b5] = 0xd1b4;            cc[0xd1b7] = 0xd1b6;            cc[0xd1b9] = 0xd1b8;            cc[0xd1bb] = 0xd1ba;
    cc[0xd1bd] = 0xd1bc;            cc[0xd1bf] = 0xd1be;            cc[0xd281] = 0xd280;            cc[0xd28b] = 0xd28a;
    cc[0xd28d] = 0xd28c;            cc[0xd28f] = 0xd28e;            cc[0xd291] = 0xd290;            cc[0xd293] = 0xd292;
    cc[0xd295] = 0xd294;            cc[0xd297] = 0xd296;            cc[0xd299] = 0xd298;            cc[0xd29b] = 0xd29a;
    cc[0xd29d] = 0xd29c;            cc[0xd29f] = 0xd29e;            cc[0xd2a1] = 0xd2a0;            cc[0xd2a3] = 0xd2a2;
    cc[0xd2a5] = 0xd2a4;            cc[0xd2a7] = 0xd2a6;            cc[0xd2a9] = 0xd2a8;            cc[0xd2ab] = 0xd2aa;
    cc[0xd2ad] = 0xd2ac;            cc[0xd2af] = 0xd2ae;            cc[0xd2b1] = 0xd2b0;            cc[0xd2b3] = 0xd2b2;
    cc[0xd2b5] = 0xd2b4;            cc[0xd2b7] = 0xd2b6;            cc[0xd2b9] = 0xd2b8;            cc[0xd2bb] = 0xd2ba;
    cc[0xd2bd] = 0xd2bc;            cc[0xd2bf] = 0xd2be;            cc[0xd382] = 0xd381;            cc[0xd384] = 0xd383;
    cc[0xd386] = 0xd385;            cc[0xd388] = 0xd387;            cc[0xd38a] = 0xd389;            cc[0xd38c] = 0xd38b;
    cc[0xd38e] = 0xd38d;            cc[0xd38f] = 0xd380;            cc[0xd391] = 0xd390;            cc[0xd393] = 0xd392;
    cc[0xd395] = 0xd394;            cc[0xd397] = 0xd396;            cc[0xd399] = 0xd398;            cc[0xd39b] = 0xd39a;
    cc[0xd39d] = 0xd39c;            cc[0xd39f] = 0xd39e;            cc[0xd3a1] = 0xd3a0;            cc[0xd3a3] = 0xd3a2;
    cc[0xd3a5] = 0xd3a4;            cc[0xd3a7] = 0xd3a6;            cc[0xd3a9] = 0xd3a8;            cc[0xd3ab] = 0xd3aa;
    cc[0xd3ad] = 0xd3ac;            cc[0xd3af] = 0xd3ae;            cc[0xd3b1] = 0xd3b0;            cc[0xd3b3] = 0xd3b2;
    cc[0xd3b5] = 0xd3b4;            cc[0xd3b7] = 0xd3b6;            cc[0xd3b9] = 0xd3b8;            cc[0xd3bb] = 0xd3ba;
    cc[0xd3bd] = 0xd3bc;            cc[0xd3bf] = 0xd3be;            cc[0xd481] = 0xd480;            cc[0xd483] = 0xd482;
    cc[0xd485] = 0xd484;            cc[0xd487] = 0xd486;            cc[0xd489] = 0xd488;            cc[0xd48b] = 0xd48a;
    cc[0xd48d] = 0xd48c;            cc[0xd48f] = 0xd48e;            cc[0xd491] = 0xd490;            cc[0xd493] = 0xd492;
    cc[0xd495] = 0xd494;            cc[0xd497] = 0xd496;            cc[0xd499] = 0xd498;            cc[0xd49b] = 0xd49a;
    cc[0xd49d] = 0xd49c;            cc[0xd49f] = 0xd49e;            cc[0xd4a1] = 0xd4a0;            cc[0xd4a3] = 0xd4a2;
    cc[0xd4a5] = 0xd4a4;            cc[0xd4a7] = 0xd4a6;            cc[0xd4a9] = 0xd4a8;            cc[0xd4ab] = 0xd4aa;
    cc[0xd4ad] = 0xd4ac;            cc[0xd4af] = 0xd4ae;            cc[0xd5a1] = 0xd4b1;            cc[0xd5a2] = 0xd4b2;
    cc[0xd5a3] = 0xd4b3;            cc[0xd5a4] = 0xd4b4;            cc[0xd5a5] = 0xd4b5;            cc[0xd5a6] = 0xd4b6;
    cc[0xd5a7] = 0xd4b7;            cc[0xd5a8] = 0xd4b8;            cc[0xd5a9] = 0xd4b9;            cc[0xd5aa] = 0xd4ba;
    cc[0xd5ab] = 0xd4bb;            cc[0xd5ac] = 0xd4bc;            cc[0xd5ad] = 0xd4bd;            cc[0xd5ae] = 0xd4be;
    cc[0xd5af] = 0xd4bf;            cc[0xd5b0] = 0xd580;            cc[0xd5b1] = 0xd581;            cc[0xd5b2] = 0xd582;
    cc[0xd5b3] = 0xd583;            cc[0xd5b4] = 0xd584;            cc[0xd5b5] = 0xd585;            cc[0xd5b6] = 0xd586;
    cc[0xd5b7] = 0xd587;            cc[0xd5b8] = 0xd588;            cc[0xd5b9] = 0xd589;            cc[0xd5ba] = 0xd58a;
    cc[0xd5bb] = 0xd58b;            cc[0xd5bc] = 0xd58c;            cc[0xd5bd] = 0xd58d;            cc[0xd5be] = 0xd58e;
    cc[0xd5bf] = 0xd58f;            cc[0xd680] = 0xd590;            cc[0xd681] = 0xd591;            cc[0xd682] = 0xd592;
    cc[0xd683] = 0xd593;            cc[0xd684] = 0xd594;            cc[0xd685] = 0xd595;            cc[0xd686] = 0xd596;
    cc[0xd687] = 0xd4b5d592;        cc[0xf09090a8] = 0xf0909080;    cc[0xf09090a9] = 0xf0909081;    cc[0xf09090aa] = 0xf0909082;
    cc[0xf09090ab] = 0xf0909083;    cc[0xf09090ac] = 0xf0909084;    cc[0xf09090ad] = 0xf0909085;    cc[0xf09090ae] = 0xf0909086;
    cc[0xf09090af] = 0xf0909087;    cc[0xf09090b0] = 0xf0909088;    cc[0xf09090b1] = 0xf0909089;    cc[0xf09090b2] = 0xf090908a;
    cc[0xf09090b3] = 0xf090908b;    cc[0xf09090b4] = 0xf090908c;    cc[0xf09090b5] = 0xf090908d;    cc[0xf09090b6] = 0xf090908e;
    cc[0xf09090b7] = 0xf090908f;    cc[0xf09090b8] = 0xf0909090;    cc[0xf09090b9] = 0xf0909091;    cc[0xf09090ba] = 0xf0909092;
    cc[0xf09090bb] = 0xf0909093;    cc[0xf09090bc] = 0xf0909094;    cc[0xf09090bd] = 0xf0909095;    cc[0xf09090be] = 0xf0909096;
    cc[0xf09090bf] = 0xf0909097;    cc[0xf0909180] = 0xf0909098;    cc[0xf0909181] = 0xf0909099;    cc[0xf0909182] = 0xf090909a;
    cc[0xf0909183] = 0xf090909b;    cc[0xf0909184] = 0xf090909c;    cc[0xf0909185] = 0xf090909d;    cc[0xf0909186] = 0xf090909e;
    cc[0xf0909187] = 0xf090909f;    cc[0xf0909188] = 0xf09090a0;    cc[0xf0909189] = 0xf09090a1;    cc[0xf090918a] = 0xf09090a2;
    cc[0xf090918b] = 0xf09090a3;    cc[0xf090918c] = 0xf09090a4;    cc[0xf090918d] = 0xf09090a5;    cc[0xf090918e] = 0xf09090a6;
    cc[0xf090918f] = 0xf09090a7;    cc[0xf0909398] = 0xf09092b0;    cc[0xf0909399] = 0xf09092b1;    cc[0xf090939a] = 0xf09092b2;
    cc[0xf090939b] = 0xf09092b3;    cc[0xf090939c] = 0xf09092b4;    cc[0xf090939d] = 0xf09092b5;    cc[0xf090939e] = 0xf09092b6;
    cc[0xf090939f] = 0xf09092b7;    cc[0xf09093a0] = 0xf09092b8;    cc[0xf09093a1] = 0xf09092b9;    cc[0xf09093a2] = 0xf09092ba;
    cc[0xf09093a3] = 0xf09092bb;    cc[0xf09093a4] = 0xf09092bc;    cc[0xf09093a5] = 0xf09092bd;    cc[0xf09093a6] = 0xf09092be;
    cc[0xf09093a7] = 0xf09092bf;    cc[0xf09093a8] = 0xf0909380;    cc[0xf09093a9] = 0xf0909381;    cc[0xf09093aa] = 0xf0909382;
    cc[0xf09093ab] = 0xf0909383;    cc[0xf09093ac] = 0xf0909384;    cc[0xf09093ad] = 0xf0909385;    cc[0xf09093ae] = 0xf0909386;
    cc[0xf09093af] = 0xf0909387;    cc[0xf09093b0] = 0xf0909388;    cc[0xf09093b1] = 0xf0909389;    cc[0xf09093b2] = 0xf090938a;
    cc[0xf09093b3] = 0xf090938b;    cc[0xf09093b4] = 0xf090938c;    cc[0xf09093b5] = 0xf090938d;    cc[0xf09093b6] = 0xf090938e;
    cc[0xf09093b7] = 0xf090938f;    cc[0xf09093b8] = 0xf0909390;    cc[0xf09093b9] = 0xf0909391;    cc[0xf09093ba] = 0xf0909392;
    cc[0xf09093bb] = 0xf0909393;    cc[0xf0909697] = 0xf09095b0;    cc[0xf0909698] = 0xf09095b1;    cc[0xf0909699] = 0xf09095b2;
    cc[0xf090969a] = 0xf09095b3;    cc[0xf090969b] = 0xf09095b4;    cc[0xf090969c] = 0xf09095b5;    cc[0xf090969d] = 0xf09095b6;
    cc[0xf090969e] = 0xf09095b7;    cc[0xf090969f] = 0xf09095b8;    cc[0xf09096a0] = 0xf09095b9;    cc[0xf09096a1] = 0xf09095ba;
    cc[0xf09096a3] = 0xf09095bc;    cc[0xf09096a4] = 0xf09095bd;    cc[0xf09096a5] = 0xf09095be;    cc[0xf09096a6] = 0xf09095bf;
    cc[0xf09096a7] = 0xf0909680;    cc[0xf09096a8] = 0xf0909681;    cc[0xf09096a9] = 0xf0909682;    cc[0xf09096aa] = 0xf0909683;
    cc[0xf09096ab] = 0xf0909684;    cc[0xf09096ac] = 0xf0909685;    cc[0xf09096ad] = 0xf0909686;    cc[0xf09096ae] = 0xf0909687;
    cc[0xf09096af] = 0xf0909688;    cc[0xf09096b0] = 0xf0909689;    cc[0xf09096b1] = 0xf090968a;    cc[0xf09096b3] = 0xf090968c;
    cc[0xf09096b4] = 0xf090968d;    cc[0xf09096b5] = 0xf090968e;    cc[0xf09096b6] = 0xf090968f;    cc[0xf09096b7] = 0xf0909690;
    cc[0xf09096b8] = 0xf0909691;    cc[0xf09096b9] = 0xf0909692;    cc[0xf09096bb] = 0xf0909694;    cc[0xf09096bc] = 0xf0909695;
    cc[0xf090b380] = 0xf090b280;    cc[0xf090b381] = 0xf090b281;    cc[0xf090b382] = 0xf090b282;    cc[0xf090b383] = 0xf090b283;
    cc[0xf090b384] = 0xf090b284;    cc[0xf090b385] = 0xf090b285;    cc[0xf090b386] = 0xf090b286;    cc[0xf090b387] = 0xf090b287;
    cc[0xf090b388] = 0xf090b288;    cc[0xf090b389] = 0xf090b289;    cc[0xf090b38a] = 0xf090b28a;    cc[0xf090b38b] = 0xf090b28b;
    cc[0xf090b38c] = 0xf090b28c;    cc[0xf090b38d] = 0xf090b28d;    cc[0xf090b38e] = 0xf090b28e;    cc[0xf090b38f] = 0xf090b28f;
    cc[0xf090b390] = 0xf090b290;    cc[0xf090b391] = 0xf090b291;    cc[0xf090b392] = 0xf090b292;    cc[0xf090b393] = 0xf090b293;
    cc[0xf090b394] = 0xf090b294;    cc[0xf090b395] = 0xf090b295;    cc[0xf090b396] = 0xf090b296;    cc[0xf090b397] = 0xf090b297;
    cc[0xf090b398] = 0xf090b298;    cc[0xf090b399] = 0xf090b299;    cc[0xf090b39a] = 0xf090b29a;    cc[0xf090b39b] = 0xf090b29b;
    cc[0xf090b39c] = 0xf090b29c;    cc[0xf090b39d] = 0xf090b29d;    cc[0xf090b39e] = 0xf090b29e;    cc[0xf090b39f] = 0xf090b29f;
    cc[0xf090b3a0] = 0xf090b2a0;    cc[0xf090b3a1] = 0xf090b2a1;    cc[0xf090b3a2] = 0xf090b2a2;    cc[0xf090b3a3] = 0xf090b2a3;
    cc[0xf090b3a4] = 0xf090b2a4;    cc[0xf090b3a5] = 0xf090b2a5;    cc[0xf090b3a6] = 0xf090b2a6;    cc[0xf090b3a7] = 0xf090b2a7;
    cc[0xf090b3a8] = 0xf090b2a8;    cc[0xf090b3a9] = 0xf090b2a9;    cc[0xf090b3aa] = 0xf090b2aa;    cc[0xf090b3ab] = 0xf090b2ab;
    cc[0xf090b3ac] = 0xf090b2ac;    cc[0xf090b3ad] = 0xf090b2ad;    cc[0xf090b3ae] = 0xf090b2ae;    cc[0xf090b3af] = 0xf090b2af;
    cc[0xf090b3b0] = 0xf090b2b0;    cc[0xf090b3b1] = 0xf090b2b1;    cc[0xf090b3b2] = 0xf090b2b2;    cc[0xf091a380] = 0xf091a2a0;
    cc[0xf091a381] = 0xf091a2a1;    cc[0xf091a382] = 0xf091a2a2;    cc[0xf091a383] = 0xf091a2a3;    cc[0xf091a384] = 0xf091a2a4;
    cc[0xf091a385] = 0xf091a2a5;    cc[0xf091a386] = 0xf091a2a6;    cc[0xf091a387] = 0xf091a2a7;    cc[0xf091a388] = 0xf091a2a8;
    cc[0xf091a389] = 0xf091a2a9;    cc[0xf091a38a] = 0xf091a2aa;    cc[0xf091a38b] = 0xf091a2ab;    cc[0xf091a38c] = 0xf091a2ac;
    cc[0xf091a38d] = 0xf091a2ad;    cc[0xf091a38e] = 0xf091a2ae;    cc[0xf091a38f] = 0xf091a2af;    cc[0xf091a390] = 0xf091a2b0;
    cc[0xf091a391] = 0xf091a2b1;    cc[0xf091a392] = 0xf091a2b2;    cc[0xf091a393] = 0xf091a2b3;    cc[0xf091a394] = 0xf091a2b4;
    cc[0xf091a395] = 0xf091a2b5;    cc[0xf091a396] = 0xf091a2b6;    cc[0xf091a397] = 0xf091a2b7;    cc[0xf091a398] = 0xf091a2b8;
    cc[0xf091a399] = 0xf091a2b9;    cc[0xf091a39a] = 0xf091a2ba;    cc[0xf091a39b] = 0xf091a2bb;    cc[0xf091a39c] = 0xf091a2bc;
    cc[0xf091a39d] = 0xf091a2bd;    cc[0xf091a39e] = 0xf091a2be;    cc[0xf091a39f] = 0xf091a2bf;    cc[0xf096b9a0] = 0xf096b980;
    cc[0xf096b9a1] = 0xf096b981;    cc[0xf096b9a2] = 0xf096b982;    cc[0xf096b9a3] = 0xf096b983;    cc[0xf096b9a4] = 0xf096b984;
    cc[0xf096b9a5] = 0xf096b985;    cc[0xf096b9a6] = 0xf096b986;    cc[0xf096b9a7] = 0xf096b987;    cc[0xf096b9a8] = 0xf096b988;
    cc[0xf096b9a9] = 0xf096b989;    cc[0xf096b9aa] = 0xf096b98a;    cc[0xf096b9ab] = 0xf096b98b;    cc[0xf096b9ac] = 0xf096b98c;
    cc[0xf096b9ad] = 0xf096b98d;    cc[0xf096b9ae] = 0xf096b98e;    cc[0xf096b9af] = 0xf096b98f;    cc[0xf096b9b0] = 0xf096b990;
    cc[0xf096b9b1] = 0xf096b991;    cc[0xf096b9b2] = 0xf096b992;    cc[0xf096b9b3] = 0xf096b993;    cc[0xf096b9b4] = 0xf096b994;
    cc[0xf096b9b5] = 0xf096b995;    cc[0xf096b9b6] = 0xf096b996;    cc[0xf096b9b7] = 0xf096b997;    cc[0xf096b9b8] = 0xf096b998;
    cc[0xf096b9b9] = 0xf096b999;    cc[0xf096b9ba] = 0xf096b99a;    cc[0xf096b9bb] = 0xf096b99b;    cc[0xf096b9bc] = 0xf096b99c;
    cc[0xf096b9bd] = 0xf096b99d;    cc[0xf096b9be] = 0xf096b99e;    cc[0xf096b9bf] = 0xf096b99f;    cc[0xf09ea4a2] = 0xf09ea480;
    cc[0xf09ea4a3] = 0xf09ea481;    cc[0xf09ea4a4] = 0xf09ea482;    cc[0xf09ea4a5] = 0xf09ea483;    cc[0xf09ea4a6] = 0xf09ea484;
    cc[0xf09ea4a7] = 0xf09ea485;    cc[0xf09ea4a8] = 0xf09ea486;    cc[0xf09ea4a9] = 0xf09ea487;    cc[0xf09ea4aa] = 0xf09ea488;
    cc[0xf09ea4ab] = 0xf09ea489;    cc[0xf09ea4ac] = 0xf09ea48a;    cc[0xf09ea4ad] = 0xf09ea48b;    cc[0xf09ea4ae] = 0xf09ea48c;
    cc[0xf09ea4af] = 0xf09ea48d;    cc[0xf09ea4b0] = 0xf09ea48e;    cc[0xf09ea4b1] = 0xf09ea48f;    cc[0xf09ea4b2] = 0xf09ea490;
    cc[0xf09ea4b3] = 0xf09ea491;    cc[0xf09ea4b4] = 0xf09ea492;    cc[0xf09ea4b5] = 0xf09ea493;    cc[0xf09ea4b6] = 0xf09ea494;
    cc[0xf09ea4b7] = 0xf09ea495;    cc[0xf09ea4b8] = 0xf09ea496;    cc[0xf09ea4b9] = 0xf09ea497;    cc[0xf09ea4ba] = 0xf09ea498;
    cc[0xf09ea4bb] = 0xf09ea499;    cc[0xf09ea4bc] = 0xf09ea49a;    cc[0xf09ea4bd] = 0xf09ea49b;    cc[0xf09ea4be] = 0xf09ea49c;
    cc[0xf09ea4bf] = 0xf09ea49d;    cc[0xf09ea580] = 0xf09ea49e;    cc[0xf09ea581] = 0xf09ea49f;    cc[0xf09ea582] = 0xf09ea4a0;
    cc[0xf09ea583] = 0xf09ea4a1;

    //

    var out,
        size,
        i,
        csize,
        cvalue,
        uvalue,
        mult,
        j;

    out = [];
    size = str.length;
    i = 0;

    while( i < size )
    {
        csize = StringUTF8GetCharacterSizeAtByteIndex( str, i );

        if( csize === 0 )
        {
            return ""; // EXCEPTION
        }

        cvalue = 0;
        mult = 1;
        for( j = 0; j < csize; j++ )
        {
            cvalue = cvalue * mult;
            cvalue = cvalue + str[ i + j ];
            mult *= 256;
        }
        if( typeof( cc[ cvalue ] ) === 'undefined' )
        {
            for( j = 0; j < csize; j++ )
            {
                out.push( str[ i + j ] );
            }
        }
        else
        {
            uvalue = cc[ cvalue ];
            if( ( uvalue & 0xff000000 ) !== 0 ) out.push( parseInt( uvalue / 16777216 ) % 256 );
            if( ( uvalue & 0x00ff0000 ) !== 0 ) out.push( parseInt( uvalue / 65536 ) % 256 );
            if( ( uvalue & 0x0000ff00 ) !== 0 ) out.push( parseInt( uvalue / 256 ) % 256 );
            if( ( uvalue & 0x000000ff ) !== 0 ) out.push( parseInt( uvalue / 1 ) % 256 );
        }

        i += csize;
    }

    return out;
}



//
// Turn the string lowercase
//

function StringUTF8ToLowercase( str )
{
    var cc = [];

    // Uppercase to lowercase

    cc[0x41] = 0x61;                cc[0x42] = 0x62;                cc[0x43] = 0x63;                cc[0x44] = 0x64;
    cc[0x45] = 0x65;                cc[0x46] = 0x66;                cc[0x47] = 0x67;                cc[0x48] = 0x68;
    cc[0x49] = 0x69;                cc[0x4a] = 0x6a;                cc[0x4b] = 0x6b;                cc[0x4c] = 0x6c;
    cc[0x4d] = 0x6d;                cc[0x4e] = 0x6e;                cc[0x4f] = 0x6f;                cc[0x50] = 0x70;
    cc[0x51] = 0x71;                cc[0x52] = 0x72;                cc[0x53] = 0x73;                cc[0x54] = 0x74;
    cc[0x55] = 0x75;                cc[0x56] = 0x76;                cc[0x57] = 0x77;                cc[0x58] = 0x78;
    cc[0x59] = 0x79;                cc[0x5a] = 0x7a;                cc[0xc380] = 0xc3a0;            cc[0xc381] = 0xc3a1;
    cc[0xc382] = 0xc3a2;            cc[0xc383] = 0xc3a3;            cc[0xc384] = 0xc3a4;            cc[0xc385] = 0xc3a5;
    cc[0xc386] = 0xc3a6;            cc[0xc387] = 0xc3a7;            cc[0xc388] = 0xc3a8;            cc[0xc389] = 0xc3a9;
    cc[0xc38a] = 0xc3aa;            cc[0xc38b] = 0xc3ab;            cc[0xc38c] = 0xc3ac;            cc[0xc38d] = 0xc3ad;
    cc[0xc38e] = 0xc3ae;            cc[0xc38f] = 0xc3af;            cc[0xc390] = 0xc3b0;            cc[0xc391] = 0xc3b1;
    cc[0xc392] = 0xc3b2;            cc[0xc393] = 0xc3b3;            cc[0xc394] = 0xc3b4;            cc[0xc395] = 0xc3b5;
    cc[0xc396] = 0xc3b6;            cc[0xc398] = 0xc3b8;            cc[0xc399] = 0xc3b9;            cc[0xc39a] = 0xc3ba;
    cc[0xc39b] = 0xc3bb;            cc[0xc39c] = 0xc3bc;            cc[0xc39d] = 0xc3bd;            cc[0xc39e] = 0xc3be;
    cc[0xc480] = 0xc481;            cc[0xc482] = 0xc483;            cc[0xc484] = 0xc485;            cc[0xc486] = 0xc487;
    cc[0xc488] = 0xc489;            cc[0xc48a] = 0xc48b;            cc[0xc48c] = 0xc48d;            cc[0xc48e] = 0xc48f;
    cc[0xc490] = 0xc491;            cc[0xc492] = 0xc493;            cc[0xc494] = 0xc495;            cc[0xc496] = 0xc497;
    cc[0xc498] = 0xc499;            cc[0xc49a] = 0xc49b;            cc[0xc49c] = 0xc49d;            cc[0xc49e] = 0xc49f;
    cc[0xc4a0] = 0xc4a1;            cc[0xc4a2] = 0xc4a3;            cc[0xc4a4] = 0xc4a5;            cc[0xc4a6] = 0xc4a7;
    cc[0xc4a8] = 0xc4a9;            cc[0xc4aa] = 0xc4ab;            cc[0xc4ac] = 0xc4ad;            cc[0xc4ae] = 0xc4af;
    cc[0xc4b0] = 0x69cc87;          cc[0xc4b2] = 0xc4b3;            cc[0xc4b4] = 0xc4b5;            cc[0xc4b6] = 0xc4b7;
    cc[0xc4b9] = 0xc4ba;            cc[0xc4bb] = 0xc4bc;            cc[0xc4bd] = 0xc4be;            cc[0xc4bf] = 0xc580;
    cc[0xc581] = 0xc582;            cc[0xc583] = 0xc584;            cc[0xc585] = 0xc586;            cc[0xc587] = 0xc588;
    cc[0xc58a] = 0xc58b;            cc[0xc58c] = 0xc58d;            cc[0xc58e] = 0xc58f;            cc[0xc590] = 0xc591;
    cc[0xc592] = 0xc593;            cc[0xc594] = 0xc595;            cc[0xc596] = 0xc597;            cc[0xc598] = 0xc599;
    cc[0xc59a] = 0xc59b;            cc[0xc59c] = 0xc59d;            cc[0xc59e] = 0xc59f;            cc[0xc5a0] = 0xc5a1;
    cc[0xc5a2] = 0xc5a3;            cc[0xc5a4] = 0xc5a5;            cc[0xc5a6] = 0xc5a7;            cc[0xc5a8] = 0xc5a9;
    cc[0xc5aa] = 0xc5ab;            cc[0xc5ac] = 0xc5ad;            cc[0xc5ae] = 0xc5af;            cc[0xc5b0] = 0xc5b1;
    cc[0xc5b2] = 0xc5b3;            cc[0xc5b4] = 0xc5b5;            cc[0xc5b6] = 0xc5b7;            cc[0xc5b8] = 0xc3bf;
    cc[0xc5b9] = 0xc5ba;            cc[0xc5bb] = 0xc5bc;            cc[0xc5bd] = 0xc5be;            cc[0xc681] = 0xc993;
    cc[0xc682] = 0xc683;            cc[0xc684] = 0xc685;            cc[0xc686] = 0xc994;            cc[0xc687] = 0xc688;
    cc[0xc689] = 0xc996;            cc[0xc68a] = 0xc997;            cc[0xc68b] = 0xc68c;            cc[0xc68e] = 0xc79d;
    cc[0xc68f] = 0xc999;            cc[0xc690] = 0xc99b;            cc[0xc691] = 0xc692;            cc[0xc693] = 0xc9a0;
    cc[0xc694] = 0xc9a3;            cc[0xc696] = 0xc9a9;            cc[0xc697] = 0xc9a8;            cc[0xc698] = 0xc699;
    cc[0xc69c] = 0xc9af;            cc[0xc69d] = 0xc9b2;            cc[0xc69f] = 0xc9b5;            cc[0xc6a0] = 0xc6a1;
    cc[0xc6a2] = 0xc6a3;            cc[0xc6a4] = 0xc6a5;            cc[0xc6a6] = 0xca80;            cc[0xc6a7] = 0xc6a8;
    cc[0xc6a9] = 0xca83;            cc[0xc6ac] = 0xc6ad;            cc[0xc6ae] = 0xca88;            cc[0xc6af] = 0xc6b0;
    cc[0xc6b1] = 0xca8a;            cc[0xc6b2] = 0xca8b;            cc[0xc6b3] = 0xc6b4;            cc[0xc6b5] = 0xc6b6;
    cc[0xc6b7] = 0xca92;            cc[0xc6b8] = 0xc6b9;            cc[0xc6bc] = 0xc6bd;            cc[0xc784] = 0xc786;
    cc[0xc785] = 0xc786;            cc[0xc787] = 0xc789;            cc[0xc788] = 0xc789;            cc[0xc78a] = 0xc78c;
    cc[0xc78b] = 0xc78c;            cc[0xc78d] = 0xc78e;            cc[0xc78f] = 0xc790;            cc[0xc791] = 0xc792;
    cc[0xc793] = 0xc794;            cc[0xc795] = 0xc796;            cc[0xc797] = 0xc798;            cc[0xc799] = 0xc79a;
    cc[0xc79b] = 0xc79c;            cc[0xc79e] = 0xc79f;            cc[0xc7a0] = 0xc7a1;            cc[0xc7a2] = 0xc7a3;
    cc[0xc7a4] = 0xc7a5;            cc[0xc7a6] = 0xc7a7;            cc[0xc7a8] = 0xc7a9;            cc[0xc7aa] = 0xc7ab;
    cc[0xc7ac] = 0xc7ad;            cc[0xc7ae] = 0xc7af;            cc[0xc7b1] = 0xc7b3;            cc[0xc7b2] = 0xc7b3;
    cc[0xc7b4] = 0xc7b5;            cc[0xc7b6] = 0xc695;            cc[0xc7b7] = 0xc6bf;            cc[0xc7b8] = 0xc7b9;
    cc[0xc7ba] = 0xc7bb;            cc[0xc7bc] = 0xc7bd;            cc[0xc7be] = 0xc7bf;            cc[0xc880] = 0xc881;
    cc[0xc882] = 0xc883;            cc[0xc884] = 0xc885;            cc[0xc886] = 0xc887;            cc[0xc888] = 0xc889;
    cc[0xc88a] = 0xc88b;            cc[0xc88c] = 0xc88d;            cc[0xc88e] = 0xc88f;            cc[0xc890] = 0xc891;
    cc[0xc892] = 0xc893;            cc[0xc894] = 0xc895;            cc[0xc896] = 0xc897;            cc[0xc898] = 0xc899;
    cc[0xc89a] = 0xc89b;            cc[0xc89c] = 0xc89d;            cc[0xc89e] = 0xc89f;            cc[0xc8a0] = 0xc69e;
    cc[0xc8a2] = 0xc8a3;            cc[0xc8a4] = 0xc8a5;            cc[0xc8a6] = 0xc8a7;            cc[0xc8a8] = 0xc8a9;
    cc[0xc8aa] = 0xc8ab;            cc[0xc8ac] = 0xc8ad;            cc[0xc8ae] = 0xc8af;            cc[0xc8b0] = 0xc8b1;
    cc[0xc8b2] = 0xc8b3;            cc[0xc8ba] = 0xe2b1a5;          cc[0xc8bb] = 0xc8bc;            cc[0xc8bd] = 0xc69a;
    cc[0xc8be] = 0xe2b1a6;          cc[0xc981] = 0xc982;            cc[0xc983] = 0xc680;            cc[0xc984] = 0xca89;
    cc[0xc985] = 0xca8c;            cc[0xc986] = 0xc987;            cc[0xc988] = 0xc989;            cc[0xc98a] = 0xc98b;
    cc[0xc98c] = 0xc98d;            cc[0xc98e] = 0xc98f;            cc[0xcdb0] = 0xcdb1;            cc[0xcdb2] = 0xcdb3;
    cc[0xcdb6] = 0xcdb7;            cc[0xcdbf] = 0xcfb3;            cc[0xce86] = 0xceac;            cc[0xce88] = 0xcead;
    cc[0xce89] = 0xceae;            cc[0xce8a] = 0xceaf;            cc[0xce8c] = 0xcf8c;            cc[0xce8e] = 0xcf8d;
    cc[0xce8f] = 0xcf8e;            cc[0xce91] = 0xceb1;            cc[0xce92] = 0xceb2;            cc[0xce93] = 0xceb3;
    cc[0xce94] = 0xceb4;            cc[0xce95] = 0xceb5;            cc[0xce96] = 0xceb6;            cc[0xce97] = 0xceb7;
    cc[0xce98] = 0xceb8;            cc[0xce99] = 0xceb9;            cc[0xce9a] = 0xceba;            cc[0xce9b] = 0xcebb;
    cc[0xce9c] = 0xcebc;            cc[0xce9d] = 0xcebd;            cc[0xce9e] = 0xcebe;            cc[0xce9f] = 0xcebf;
    cc[0xcea0] = 0xcf80;            cc[0xcea1] = 0xcf81;            cc[0xcea3] = 0xcf83;            cc[0xcea4] = 0xcf84;
    cc[0xcea5] = 0xcf85;            cc[0xcea6] = 0xcf86;            cc[0xcea7] = 0xcf87;            cc[0xcea8] = 0xcf88;
    cc[0xcea9] = 0xcf89;            cc[0xceaa] = 0xcf8a;            cc[0xceab] = 0xcf8b;            cc[0xcf8f] = 0xcf97;
    cc[0xcf98] = 0xcf99;            cc[0xcf9a] = 0xcf9b;            cc[0xcf9c] = 0xcf9d;            cc[0xcf9e] = 0xcf9f;
    cc[0xcfa0] = 0xcfa1;            cc[0xcfa2] = 0xcfa3;            cc[0xcfa4] = 0xcfa5;            cc[0xcfa6] = 0xcfa7;
    cc[0xcfa8] = 0xcfa9;            cc[0xcfaa] = 0xcfab;            cc[0xcfac] = 0xcfad;            cc[0xcfae] = 0xcfaf;
    cc[0xcfb4] = 0xceb8;            cc[0xcfb7] = 0xcfb8;            cc[0xcfb9] = 0xcfb2;            cc[0xcfba] = 0xcfbb;
    cc[0xcfbd] = 0xcdbb;            cc[0xcfbe] = 0xcdbc;            cc[0xcfbf] = 0xcdbd;            cc[0xd080] = 0xd190;
    cc[0xd081] = 0xd191;            cc[0xd082] = 0xd192;            cc[0xd083] = 0xd193;            cc[0xd084] = 0xd194;
    cc[0xd085] = 0xd195;            cc[0xd086] = 0xd196;            cc[0xd087] = 0xd197;            cc[0xd088] = 0xd198;
    cc[0xd089] = 0xd199;            cc[0xd08a] = 0xd19a;            cc[0xd08b] = 0xd19b;            cc[0xd08c] = 0xd19c;
    cc[0xd08d] = 0xd19d;            cc[0xd08e] = 0xd19e;            cc[0xd08f] = 0xd19f;            cc[0xd090] = 0xd0b0;
    cc[0xd091] = 0xd0b1;            cc[0xd092] = 0xd0b2;            cc[0xd093] = 0xd0b3;            cc[0xd094] = 0xd0b4;
    cc[0xd095] = 0xd0b5;            cc[0xd096] = 0xd0b6;            cc[0xd097] = 0xd0b7;            cc[0xd098] = 0xd0b8;
    cc[0xd099] = 0xd0b9;            cc[0xd09a] = 0xd0ba;            cc[0xd09b] = 0xd0bb;            cc[0xd09c] = 0xd0bc;
    cc[0xd09d] = 0xd0bd;            cc[0xd09e] = 0xd0be;            cc[0xd09f] = 0xd0bf;            cc[0xd0a0] = 0xd180;
    cc[0xd0a1] = 0xd181;            cc[0xd0a2] = 0xd182;            cc[0xd0a3] = 0xd183;            cc[0xd0a4] = 0xd184;
    cc[0xd0a5] = 0xd185;            cc[0xd0a6] = 0xd186;            cc[0xd0a7] = 0xd187;            cc[0xd0a8] = 0xd188;
    cc[0xd0a9] = 0xd189;            cc[0xd0aa] = 0xd18a;            cc[0xd0ab] = 0xd18b;            cc[0xd0ac] = 0xd18c;
    cc[0xd0ad] = 0xd18d;            cc[0xd0ae] = 0xd18e;            cc[0xd0af] = 0xd18f;            cc[0xd1a0] = 0xd1a1;
    cc[0xd1a2] = 0xd1a3;            cc[0xd1a4] = 0xd1a5;            cc[0xd1a6] = 0xd1a7;            cc[0xd1a8] = 0xd1a9;
    cc[0xd1aa] = 0xd1ab;            cc[0xd1ac] = 0xd1ad;            cc[0xd1ae] = 0xd1af;            cc[0xd1b0] = 0xd1b1;
    cc[0xd1b2] = 0xd1b3;            cc[0xd1b4] = 0xd1b5;            cc[0xd1b6] = 0xd1b7;            cc[0xd1b8] = 0xd1b9;
    cc[0xd1ba] = 0xd1bb;            cc[0xd1bc] = 0xd1bd;            cc[0xd1be] = 0xd1bf;            cc[0xd280] = 0xd281;
    cc[0xd28a] = 0xd28b;            cc[0xd28c] = 0xd28d;            cc[0xd28e] = 0xd28f;            cc[0xd290] = 0xd291;
    cc[0xd292] = 0xd293;            cc[0xd294] = 0xd295;            cc[0xd296] = 0xd297;            cc[0xd298] = 0xd299;
    cc[0xd29a] = 0xd29b;            cc[0xd29c] = 0xd29d;            cc[0xd29e] = 0xd29f;            cc[0xd2a0] = 0xd2a1;
    cc[0xd2a2] = 0xd2a3;            cc[0xd2a4] = 0xd2a5;            cc[0xd2a6] = 0xd2a7;            cc[0xd2a8] = 0xd2a9;
    cc[0xd2aa] = 0xd2ab;            cc[0xd2ac] = 0xd2ad;            cc[0xd2ae] = 0xd2af;            cc[0xd2b0] = 0xd2b1;
    cc[0xd2b2] = 0xd2b3;            cc[0xd2b4] = 0xd2b5;            cc[0xd2b6] = 0xd2b7;            cc[0xd2b8] = 0xd2b9;
    cc[0xd2ba] = 0xd2bb;            cc[0xd2bc] = 0xd2bd;            cc[0xd2be] = 0xd2bf;            cc[0xd380] = 0xd38f;
    cc[0xd381] = 0xd382;            cc[0xd383] = 0xd384;            cc[0xd385] = 0xd386;            cc[0xd387] = 0xd388;
    cc[0xd389] = 0xd38a;            cc[0xd38b] = 0xd38c;            cc[0xd38d] = 0xd38e;            cc[0xd390] = 0xd391;
    cc[0xd392] = 0xd393;            cc[0xd394] = 0xd395;            cc[0xd396] = 0xd397;            cc[0xd398] = 0xd399;
    cc[0xd39a] = 0xd39b;            cc[0xd39c] = 0xd39d;            cc[0xd39e] = 0xd39f;            cc[0xd3a0] = 0xd3a1;
    cc[0xd3a2] = 0xd3a3;            cc[0xd3a4] = 0xd3a5;            cc[0xd3a6] = 0xd3a7;            cc[0xd3a8] = 0xd3a9;
    cc[0xd3aa] = 0xd3ab;            cc[0xd3ac] = 0xd3ad;            cc[0xd3ae] = 0xd3af;            cc[0xd3b0] = 0xd3b1;
    cc[0xd3b2] = 0xd3b3;            cc[0xd3b4] = 0xd3b5;            cc[0xd3b6] = 0xd3b7;            cc[0xd3b8] = 0xd3b9;
    cc[0xd3ba] = 0xd3bb;            cc[0xd3bc] = 0xd3bd;            cc[0xd3be] = 0xd3bf;            cc[0xd480] = 0xd481;
    cc[0xd482] = 0xd483;            cc[0xd484] = 0xd485;            cc[0xd486] = 0xd487;            cc[0xd488] = 0xd489;
    cc[0xd48a] = 0xd48b;            cc[0xd48c] = 0xd48d;            cc[0xd48e] = 0xd48f;            cc[0xd490] = 0xd491;
    cc[0xd492] = 0xd493;            cc[0xd494] = 0xd495;            cc[0xd496] = 0xd497;            cc[0xd498] = 0xd499;
    cc[0xd49a] = 0xd49b;            cc[0xd49c] = 0xd49d;            cc[0xd49e] = 0xd49f;            cc[0xd4a0] = 0xd4a1;
    cc[0xd4a2] = 0xd4a3;            cc[0xd4a4] = 0xd4a5;            cc[0xd4a6] = 0xd4a7;            cc[0xd4a8] = 0xd4a9;
    cc[0xd4aa] = 0xd4ab;            cc[0xd4ac] = 0xd4ad;            cc[0xd4ae] = 0xd4af;            cc[0xd4b1] = 0xd5a1;
    cc[0xd4b2] = 0xd5a2;            cc[0xd4b3] = 0xd5a3;            cc[0xd4b4] = 0xd5a4;            cc[0xd4b5] = 0xd5a5;
    cc[0xd4b6] = 0xd5a6;            cc[0xd4b7] = 0xd5a7;            cc[0xd4b8] = 0xd5a8;            cc[0xd4b9] = 0xd5a9;
    cc[0xd4ba] = 0xd5aa;            cc[0xd4bb] = 0xd5ab;            cc[0xd4bc] = 0xd5ac;            cc[0xd4bd] = 0xd5ad;
    cc[0xd4be] = 0xd5ae;            cc[0xd4bf] = 0xd5af;            cc[0xd580] = 0xd5b0;            cc[0xd581] = 0xd5b1;
    cc[0xd582] = 0xd5b2;            cc[0xd583] = 0xd5b3;            cc[0xd584] = 0xd5b4;            cc[0xd585] = 0xd5b5;
    cc[0xd586] = 0xd5b6;            cc[0xd587] = 0xd5b7;            cc[0xd588] = 0xd5b8;            cc[0xd589] = 0xd5b9;
    cc[0xd58a] = 0xd5ba;            cc[0xd58b] = 0xd5bb;            cc[0xd58c] = 0xd5bc;            cc[0xd58d] = 0xd5bd;
    cc[0xd58e] = 0xd5be;            cc[0xd58f] = 0xd5bf;            cc[0xd590] = 0xd680;            cc[0xd591] = 0xd681;
    cc[0xd592] = 0xd682;            cc[0xd593] = 0xd683;            cc[0xd594] = 0xd684;            cc[0xd595] = 0xd685;
    cc[0xd596] = 0xd686;            cc[0xf0909080] = 0xf09090a8;    cc[0xf0909081] = 0xf09090a9;    cc[0xf0909082] = 0xf09090aa;
    cc[0xf0909083] = 0xf09090ab;    cc[0xf0909084] = 0xf09090ac;    cc[0xf0909085] = 0xf09090ad;    cc[0xf0909086] = 0xf09090ae;
    cc[0xf0909087] = 0xf09090af;    cc[0xf0909088] = 0xf09090b0;    cc[0xf0909089] = 0xf09090b1;    cc[0xf090908a] = 0xf09090b2;
    cc[0xf090908b] = 0xf09090b3;    cc[0xf090908c] = 0xf09090b4;    cc[0xf090908d] = 0xf09090b5;    cc[0xf090908e] = 0xf09090b6;
    cc[0xf090908f] = 0xf09090b7;    cc[0xf0909090] = 0xf09090b8;    cc[0xf0909091] = 0xf09090b9;    cc[0xf0909092] = 0xf09090ba;
    cc[0xf0909093] = 0xf09090bb;    cc[0xf0909094] = 0xf09090bc;    cc[0xf0909095] = 0xf09090bd;    cc[0xf0909096] = 0xf09090be;
    cc[0xf0909097] = 0xf09090bf;    cc[0xf0909098] = 0xf0909180;    cc[0xf0909099] = 0xf0909181;    cc[0xf090909a] = 0xf0909182;
    cc[0xf090909b] = 0xf0909183;    cc[0xf090909c] = 0xf0909184;    cc[0xf090909d] = 0xf0909185;    cc[0xf090909e] = 0xf0909186;
    cc[0xf090909f] = 0xf0909187;    cc[0xf09090a0] = 0xf0909188;    cc[0xf09090a1] = 0xf0909189;    cc[0xf09090a2] = 0xf090918a;
    cc[0xf09090a3] = 0xf090918b;    cc[0xf09090a4] = 0xf090918c;    cc[0xf09090a5] = 0xf090918d;    cc[0xf09090a6] = 0xf090918e;
    cc[0xf09090a7] = 0xf090918f;    cc[0xf09092b0] = 0xf0909398;    cc[0xf09092b1] = 0xf0909399;    cc[0xf09092b2] = 0xf090939a;
    cc[0xf09092b3] = 0xf090939b;    cc[0xf09092b4] = 0xf090939c;    cc[0xf09092b5] = 0xf090939d;    cc[0xf09092b6] = 0xf090939e;
    cc[0xf09092b7] = 0xf090939f;    cc[0xf09092b8] = 0xf09093a0;    cc[0xf09092b9] = 0xf09093a1;    cc[0xf09092ba] = 0xf09093a2;
    cc[0xf09092bb] = 0xf09093a3;    cc[0xf09092bc] = 0xf09093a4;    cc[0xf09092bd] = 0xf09093a5;    cc[0xf09092be] = 0xf09093a6;
    cc[0xf09092bf] = 0xf09093a7;    cc[0xf0909380] = 0xf09093a8;    cc[0xf0909381] = 0xf09093a9;    cc[0xf0909382] = 0xf09093aa;
    cc[0xf0909383] = 0xf09093ab;    cc[0xf0909384] = 0xf09093ac;    cc[0xf0909385] = 0xf09093ad;    cc[0xf0909386] = 0xf09093ae;
    cc[0xf0909387] = 0xf09093af;    cc[0xf0909388] = 0xf09093b0;    cc[0xf0909389] = 0xf09093b1;    cc[0xf090938a] = 0xf09093b2;
    cc[0xf090938b] = 0xf09093b3;    cc[0xf090938c] = 0xf09093b4;    cc[0xf090938d] = 0xf09093b5;    cc[0xf090938e] = 0xf09093b6;
    cc[0xf090938f] = 0xf09093b7;    cc[0xf0909390] = 0xf09093b8;    cc[0xf0909391] = 0xf09093b9;    cc[0xf0909392] = 0xf09093ba;
    cc[0xf0909393] = 0xf09093bb;    cc[0xf09095b0] = 0xf0909697;    cc[0xf09095b1] = 0xf0909698;    cc[0xf09095b2] = 0xf0909699;
    cc[0xf09095b3] = 0xf090969a;    cc[0xf09095b4] = 0xf090969b;    cc[0xf09095b5] = 0xf090969c;    cc[0xf09095b6] = 0xf090969d;
    cc[0xf09095b7] = 0xf090969e;    cc[0xf09095b8] = 0xf090969f;    cc[0xf09095b9] = 0xf09096a0;    cc[0xf09095ba] = 0xf09096a1;
    cc[0xf09095bc] = 0xf09096a3;    cc[0xf09095bd] = 0xf09096a4;    cc[0xf09095be] = 0xf09096a5;    cc[0xf09095bf] = 0xf09096a6;
    cc[0xf0909680] = 0xf09096a7;    cc[0xf0909681] = 0xf09096a8;    cc[0xf0909682] = 0xf09096a9;    cc[0xf0909683] = 0xf09096aa;
    cc[0xf0909684] = 0xf09096ab;    cc[0xf0909685] = 0xf09096ac;    cc[0xf0909686] = 0xf09096ad;    cc[0xf0909687] = 0xf09096ae;
    cc[0xf0909688] = 0xf09096af;    cc[0xf0909689] = 0xf09096b0;    cc[0xf090968a] = 0xf09096b1;    cc[0xf090968c] = 0xf09096b3;
    cc[0xf090968d] = 0xf09096b4;    cc[0xf090968e] = 0xf09096b5;    cc[0xf090968f] = 0xf09096b6;    cc[0xf0909690] = 0xf09096b7;
    cc[0xf0909691] = 0xf09096b8;    cc[0xf0909692] = 0xf09096b9;    cc[0xf0909694] = 0xf09096bb;    cc[0xf0909695] = 0xf09096bc;
    cc[0xf090b280] = 0xf090b380;    cc[0xf090b281] = 0xf090b381;    cc[0xf090b282] = 0xf090b382;    cc[0xf090b283] = 0xf090b383;
    cc[0xf090b284] = 0xf090b384;    cc[0xf090b285] = 0xf090b385;    cc[0xf090b286] = 0xf090b386;    cc[0xf090b287] = 0xf090b387;
    cc[0xf090b288] = 0xf090b388;    cc[0xf090b289] = 0xf090b389;    cc[0xf090b28a] = 0xf090b38a;    cc[0xf090b28b] = 0xf090b38b;
    cc[0xf090b28c] = 0xf090b38c;    cc[0xf090b28d] = 0xf090b38d;    cc[0xf090b28e] = 0xf090b38e;    cc[0xf090b28f] = 0xf090b38f;
    cc[0xf090b290] = 0xf090b390;    cc[0xf090b291] = 0xf090b391;    cc[0xf090b292] = 0xf090b392;    cc[0xf090b293] = 0xf090b393;
    cc[0xf090b294] = 0xf090b394;    cc[0xf090b295] = 0xf090b395;    cc[0xf090b296] = 0xf090b396;    cc[0xf090b297] = 0xf090b397;
    cc[0xf090b298] = 0xf090b398;    cc[0xf090b299] = 0xf090b399;    cc[0xf090b29a] = 0xf090b39a;    cc[0xf090b29b] = 0xf090b39b;
    cc[0xf090b29c] = 0xf090b39c;    cc[0xf090b29d] = 0xf090b39d;    cc[0xf090b29e] = 0xf090b39e;    cc[0xf090b29f] = 0xf090b39f;
    cc[0xf090b2a0] = 0xf090b3a0;    cc[0xf090b2a1] = 0xf090b3a1;    cc[0xf090b2a2] = 0xf090b3a2;    cc[0xf090b2a3] = 0xf090b3a3;
    cc[0xf090b2a4] = 0xf090b3a4;    cc[0xf090b2a5] = 0xf090b3a5;    cc[0xf090b2a6] = 0xf090b3a6;    cc[0xf090b2a7] = 0xf090b3a7;
    cc[0xf090b2a8] = 0xf090b3a8;    cc[0xf090b2a9] = 0xf090b3a9;    cc[0xf090b2aa] = 0xf090b3aa;    cc[0xf090b2ab] = 0xf090b3ab;
    cc[0xf090b2ac] = 0xf090b3ac;    cc[0xf090b2ad] = 0xf090b3ad;    cc[0xf090b2ae] = 0xf090b3ae;    cc[0xf090b2af] = 0xf090b3af;
    cc[0xf090b2b0] = 0xf090b3b0;    cc[0xf090b2b1] = 0xf090b3b1;    cc[0xf090b2b2] = 0xf090b3b2;    cc[0xf091a2a0] = 0xf091a380;
    cc[0xf091a2a1] = 0xf091a381;    cc[0xf091a2a2] = 0xf091a382;    cc[0xf091a2a3] = 0xf091a383;    cc[0xf091a2a4] = 0xf091a384;
    cc[0xf091a2a5] = 0xf091a385;    cc[0xf091a2a6] = 0xf091a386;    cc[0xf091a2a7] = 0xf091a387;    cc[0xf091a2a8] = 0xf091a388;
    cc[0xf091a2a9] = 0xf091a389;    cc[0xf091a2aa] = 0xf091a38a;    cc[0xf091a2ab] = 0xf091a38b;    cc[0xf091a2ac] = 0xf091a38c;
    cc[0xf091a2ad] = 0xf091a38d;    cc[0xf091a2ae] = 0xf091a38e;    cc[0xf091a2af] = 0xf091a38f;    cc[0xf091a2b0] = 0xf091a390;
    cc[0xf091a2b1] = 0xf091a391;    cc[0xf091a2b2] = 0xf091a392;    cc[0xf091a2b3] = 0xf091a393;    cc[0xf091a2b4] = 0xf091a394;
    cc[0xf091a2b5] = 0xf091a395;    cc[0xf091a2b6] = 0xf091a396;    cc[0xf091a2b7] = 0xf091a397;    cc[0xf091a2b8] = 0xf091a398;
    cc[0xf091a2b9] = 0xf091a399;    cc[0xf091a2ba] = 0xf091a39a;    cc[0xf091a2bb] = 0xf091a39b;    cc[0xf091a2bc] = 0xf091a39c;
    cc[0xf091a2bd] = 0xf091a39d;    cc[0xf091a2be] = 0xf091a39e;    cc[0xf091a2bf] = 0xf091a39f;    cc[0xf096b980] = 0xf096b9a0;
    cc[0xf096b981] = 0xf096b9a1;    cc[0xf096b982] = 0xf096b9a2;    cc[0xf096b983] = 0xf096b9a3;    cc[0xf096b984] = 0xf096b9a4;
    cc[0xf096b985] = 0xf096b9a5;    cc[0xf096b986] = 0xf096b9a6;    cc[0xf096b987] = 0xf096b9a7;    cc[0xf096b988] = 0xf096b9a8;
    cc[0xf096b989] = 0xf096b9a9;    cc[0xf096b98a] = 0xf096b9aa;    cc[0xf096b98b] = 0xf096b9ab;    cc[0xf096b98c] = 0xf096b9ac;
    cc[0xf096b98d] = 0xf096b9ad;    cc[0xf096b98e] = 0xf096b9ae;    cc[0xf096b98f] = 0xf096b9af;    cc[0xf096b990] = 0xf096b9b0;
    cc[0xf096b991] = 0xf096b9b1;    cc[0xf096b992] = 0xf096b9b2;    cc[0xf096b993] = 0xf096b9b3;    cc[0xf096b994] = 0xf096b9b4;
    cc[0xf096b995] = 0xf096b9b5;    cc[0xf096b996] = 0xf096b9b6;    cc[0xf096b997] = 0xf096b9b7;    cc[0xf096b998] = 0xf096b9b8;
    cc[0xf096b999] = 0xf096b9b9;    cc[0xf096b99a] = 0xf096b9ba;    cc[0xf096b99b] = 0xf096b9bb;    cc[0xf096b99c] = 0xf096b9bc;
    cc[0xf096b99d] = 0xf096b9bd;    cc[0xf096b99e] = 0xf096b9be;    cc[0xf096b99f] = 0xf096b9bf;    cc[0xf09ea480] = 0xf09ea4a2;
    cc[0xf09ea481] = 0xf09ea4a3;    cc[0xf09ea482] = 0xf09ea4a4;    cc[0xf09ea483] = 0xf09ea4a5;    cc[0xf09ea484] = 0xf09ea4a6;
    cc[0xf09ea485] = 0xf09ea4a7;    cc[0xf09ea486] = 0xf09ea4a8;    cc[0xf09ea487] = 0xf09ea4a9;    cc[0xf09ea488] = 0xf09ea4aa;
    cc[0xf09ea489] = 0xf09ea4ab;    cc[0xf09ea48a] = 0xf09ea4ac;    cc[0xf09ea48b] = 0xf09ea4ad;    cc[0xf09ea48c] = 0xf09ea4ae;
    cc[0xf09ea48d] = 0xf09ea4af;    cc[0xf09ea48e] = 0xf09ea4b0;    cc[0xf09ea48f] = 0xf09ea4b1;    cc[0xf09ea490] = 0xf09ea4b2;
    cc[0xf09ea491] = 0xf09ea4b3;    cc[0xf09ea492] = 0xf09ea4b4;    cc[0xf09ea493] = 0xf09ea4b5;    cc[0xf09ea494] = 0xf09ea4b6;
    cc[0xf09ea495] = 0xf09ea4b7;    cc[0xf09ea496] = 0xf09ea4b8;    cc[0xf09ea497] = 0xf09ea4b9;    cc[0xf09ea498] = 0xf09ea4ba;
    cc[0xf09ea499] = 0xf09ea4bb;    cc[0xf09ea49a] = 0xf09ea4bc;    cc[0xf09ea49b] = 0xf09ea4bd;    cc[0xf09ea49c] = 0xf09ea4be;
    cc[0xf09ea49d] = 0xf09ea4bf;    cc[0xf09ea49e] = 0xf09ea580;    cc[0xf09ea49f] = 0xf09ea581;    cc[0xf09ea4a0] = 0xf09ea582;
    cc[0xf09ea4a1] = 0xf09ea583;

    //

    var out,
        size,
        i,
        csize,
        cvalue,
        uvalue,
        mult,
        j;

    out = [];
    size = str.length;
    i = 0;

    while( i < size )
    {
        csize = StringUTF8GetCharacterSizeAtByteIndex( str, i );

        if( csize === 0 )
        {
            return ""; // EXCEPTION
        }

        cvalue = 0;
        mult = 1;
        for( j = 0; j < csize; j++ )
        {
            cvalue = cvalue * mult;
            cvalue = cvalue + str[ i + j ];
            mult *= 256;
        }
        if( typeof( cc[ cvalue ] ) === 'undefined' )
        {
            for( j = 0; j < csize; j++ )
            {
                out.push( str[ i + j ] );
            }
        }
        else
        {
            uvalue = cc[ cvalue ];
            if( ( uvalue & 0xff000000 ) !== 0 ) out.push( parseInt( uvalue / 16777216 ) % 256 );
            if( ( uvalue & 0x00ff0000 ) !== 0 ) out.push( parseInt( uvalue / 65536 ) % 256 );
            if( ( uvalue & 0x0000ff00 ) !== 0 ) out.push( parseInt( uvalue / 256 ) % 256 );
            if( ( uvalue & 0x000000ff ) !== 0 ) out.push( parseInt( uvalue / 1 ) % 256 );
        }

        i += csize;
    }

    return out;
}