use extism_pdk::*;

#[plugin_fn]
pub fn run(pixels: Vec<u8>) -> FnResult<Vec<u8>> {
    let mut modified_pixels = Vec::with_capacity(pixels.len());

    for &pixel in pixels.iter() {
        modified_pixels.push(255 - pixel);
    }

    Ok(modified_pixels)
}