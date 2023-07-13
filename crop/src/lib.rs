use extism_pdk::*;

#[plugin_fn]
pub fn run(pixels: Vec<u8>) -> FnResult<Vec<u8>> {

    let width = get_u32("width");
    let height = get_u32("height");

    const CROP_PERCENTAGE: f32 = 0.25;

    let cropped_width = (width as f32 * (1.0 - CROP_PERCENTAGE)) as u32;
    let cropped_height = (height as f32 * (1.0 - CROP_PERCENTAGE)) as u32;
    let crop_left = ((width - cropped_width) / 2) as usize;
    let crop_right = crop_left + cropped_width as usize;
    let crop_top = ((height - cropped_height) / 2) as usize;

    let cropped_pixels = pixels
        .chunks_exact(width as usize)
        .skip(crop_top)
        .take(cropped_height as usize)
        .flat_map(|row| &row[crop_left..crop_right])
        .cloned()
        .collect::<Vec<u8>>();
        
    set_u32("width", cropped_width);
    set_u32("height", cropped_height);

    Ok(cropped_pixels)
}

fn get_u32(name: &str) -> u32 {
    let bytes : Vec<u8> = var::get(name).unwrap().unwrap();
    let mut buf = [0; 4];
    buf.copy_from_slice(&bytes);

    return u32::from_ne_bytes(buf);
}

fn set_u32(name: &str, value: u32) {
    let bytes = value.to_ne_bytes().to_vec();
    var::set(name, bytes).unwrap();
}