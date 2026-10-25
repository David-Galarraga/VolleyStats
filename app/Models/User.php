<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id_user';

    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_user_type',
        'name_user',
        'name',
        'email',
        'email_verified_at',
        'password',
        'is_active',
        'fecha_creation_user',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * Accessor for 'name' attribute.
     */
    public function getNameAttribute(): ?string
    {
        return $this->attributes['name_user'] ?? null;
    }

    public function assignedGames(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'game_planillero', 'user_id', 'game_id')
            ->withPivot('assigned_by')
            ->withTimestamps();
    }

    /**
     * Mutator for 'name' attribute.
     */
    public function setNameAttribute($value): void
    {
        $this->attributes['name_user'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'fecha_creation_user' => 'datetime',
        ];
    }
}
