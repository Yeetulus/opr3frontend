import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category-service/category.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent {
  categoryForm: FormGroup;
  color: string = '#ffffff';

  constructor(private fb: FormBuilder, private categoryService: CategoryService, private router: Router) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      color: ['', [Validators.required, this.validateColor()]]
    });
  }

  validateColor(): Validators {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const colorRegex = /^#([0-9A-Fa-f]{6})$/;
      if (!colorRegex.test(control.value)) {
        return { invalidColor: true };
      }

      const hexColor = control.value;
      const rgbColor = this.hexToRgb(hexColor);
      const hslColor = this.rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b);
      return hslColor.l >= 0.5 ? null : { lightnessBelowThreshold: true };
    };
  }

  hexToRgb(hex: string): { r: number, g: number, b: number } {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
  }

  rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;

    const max = Math.max(normalizedR, normalizedG, normalizedB);
    const min = Math.min(normalizedR, normalizedG, normalizedB);

    const l = (max + min) / 2;

    return { h: 0, s: 0, l };
  }

  submitForm() {
    if (this.categoryForm.valid) {
      const categoryRequest = this.categoryForm.value;
      this.categoryService.createCategory(categoryRequest).subscribe(
        (response) => {
          console.log('Category created successfully:', response);
          this.router.navigate(['/main']);
        },
        (error) => {
          console.error('Error creating category:', error);
        }
      );
    }
  }
}
