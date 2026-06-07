export function getProductImage(productName) {
  if (!productName) return '/images/shoes.jpg';
  
  const name = productName.toLowerCase();
  
  // Specific mappings
  if (name.includes('headphones') || name.includes('sony')) return '/images/headphones.jpg';
  if (name.includes('iphone') || name.includes('apple iphone')) return '/images/iphone.jpg';
  if (name.includes('dress') || name.includes('maxi') || name.includes('floral summer')) return '/images/dress.jpg';
  if (name.includes('jacket') || name.includes('leather')) return '/images/jacket.jpg';
  if (name.includes('nike') || (name.includes('shoes') && !name.includes('adidas') && !name.includes('puma') && !name.includes('running'))) return '/images/shoes.jpg';
  if (name.includes('nike air max') || name.includes('running shoes')) return '/images/shoes.jpg';
  if (name.includes('vase') || name.includes('ceramic')) return '/images/vase.jpg';
  if (name.includes('lipstick') || name.includes('velvet matte')) return '/images/lipstick.jpg';
  if (name.includes('yoga') || name.includes('mat')) return '/images/yogamat.jpg';
  if (name.includes('habits') || name.includes('atomic')) return '/images/book_habits.jpg';
  if (name.includes('falcon') || name.includes('millennium')) return '/images/lego_falcon.jpg';
  if (name.includes('monopoly')) return '/images/monopoly.jpg';
  if (name.includes('coffee') || name.includes('ethiopian')) return '/images/coffee.jpg';
  if (name.includes('adidas') || name.includes('ultraboot')) return '/images/shoes_adidas.jpg';
  if (name.includes('puma') || name.includes('suede')) return '/images/shoes_puma.jpg';
  if (name.includes('ipad') || name.includes('tablet')) return '/images/ipad.jpg';
  if (name.includes('alchemist')) return '/images/book_alchemist.jpg';
  if (name.includes('statue') || name.includes('liberty')) return '/images/lego_statue.jpg';
  if (name.includes('matcha') || name.includes('tea') || name.includes('uji matcha')) return '/images/matcha.jpg';
  
  // New images mappings
  if (name.includes('watch') || name.includes('fitness') || name.includes('smartwatch')) return '/images/watch.jpg';
  if (name.includes('camera') || name.includes('dslr')) return '/images/camera.jpg';
  if (name.includes('sunglasses') || name.includes('glass')) return '/images/sunglasses.jpg';
  if (name.includes('keyboard') || name.includes('mechanical')) return '/images/keyboard.jpg';

  // Generic fallback check
  if (name.includes('book')) return '/images/book_habits.jpg';
  if (name.includes('toy') || name.includes('lego')) return '/images/lego_falcon.jpg';
  if (name.includes('shoe') || name.includes('sneaker')) return '/images/shoes.jpg';
  if (name.includes('clothing') || name.includes('shirt') || name.includes('t-shirt') || name.includes('pant') || name.includes('skirt')) return '/images/dress.jpg';
  
  return '/images/shoes.jpg'; // default fallback
}
