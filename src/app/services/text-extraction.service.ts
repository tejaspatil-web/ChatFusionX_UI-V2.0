import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class TextExtractionService {
private _pdfToPngConversionUrl = baseUrl.pdfToPngConversionUrl;
private _textExtractionUrl = baseUrl.textExtractionUrl;
constructor(private _httpClient: HttpClient) {}

pdfToPngConversion(file:File){
  const formData = new FormData();
  formData.append('file',file)
 return this._httpClient.post(`${this._pdfToPngConversionUrl}`,formData)
}

textExtraction(image:File){
  const formData = new FormData();
  formData.append('image',image)
 return this._httpClient.post(`${this._textExtractionUrl}`,formData)
}

}
