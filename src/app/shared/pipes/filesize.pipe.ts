import { Pipe, PipeTransform } from '@angular/core';
import { filesize } from 'filesize';
/**
 * Näyttää luvun tavuina, kilotavuina, megatavuina jne.
 *
 * @export
 * @class FileSizePipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'filesize'
})

export class FileSizePipe implements PipeTransform {
  private static transformOne(value: number, options?: any): any {
    return filesize(value, options);
  }

  transform(value: number | number[], options?: any) {
    if (Array.isArray(value)) {
      return value.map(val => FileSizePipe.transformOne(val, options));
    }

    return FileSizePipe.transformOne(value, options);
  }
}