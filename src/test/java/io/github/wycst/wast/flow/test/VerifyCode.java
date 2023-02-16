package io.github.wycst.wast.flow.test;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
 
import javax.imageio.ImageIO;
 
public class VerifyCode{
 
  public static void main(String[] args) {
 
    try {
      // 读取原图片
      File oldPic = new File("captcha.jpg");
      BufferedImage oldBimg = ImageIO.read(oldPic);
 
      //计算新图片的宽度和高度
      int width = 106;
      int height = 40;
 
      // 创建一个新的图片
      BufferedImage newBimg = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
 
      //计算x\y来截取旧图片的矩形区域
      for(int x = 0; x < width; x++) {
        for (int y = 0; y < height; y++) {
          int pixel = oldBimg.getRGB(x + 18, y + 5);
          newBimg.setRGB(x, y, pixel);
        }
      }
 
      //保存图片
      ImageIO.write(newBimg, "jpg", new File("new_captcha.jpg"));
 
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
