<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlayoffBracket extends Model
{
    protected $fillable = ['tournament_id', 'category_id'];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id_category');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(PlayoffMatch::class, 'bracket_id')->orderBy('id');
    }
}
