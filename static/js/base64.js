function decodeBase64(string) {
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  var result     = '';

  var i = 0;
  do {
      var b1 = characters.indexOf( string.charAt(i++) );
      var b2 = characters.indexOf( string.charAt(i++) );
      var b3 = characters.indexOf( string.charAt(i++) );
      var b4 = characters.indexOf( string.charAt(i++) );

      var a = ( ( b1 & 0x3F ) << 2 ) | ( ( b2 >> 4 ) & 0x3 );
      var b = ( ( b2 & 0xF  ) << 4 ) | ( ( b3 >> 2 ) & 0xF );
      var c = ( ( b3 & 0x3  ) << 6 ) | ( b4 & 0x3F );

      result += String.fromCharCode(a) + (b?String.fromCharCode(b):'') + (c?String.fromCharCode(c):'');

  } while( i < string.length );
return result;
}
        
