#include <stdio.h>
#include <string.h>

int main() {
  puts("enter the password");
  int pass; scanf("%d", &pass);
  puts("another one");
  int pass2; scanf("%d", &pass2);  
  pass += 21;
  pass2 -= 8;
  
  for (int i = 1; i <= pass2; i*=2)
    pass = (pass + 3);

  pass *= 9;
  
  if (pass == 360)
    puts("correct!");
  else 
    puts("noob");
}
