<?php
//
///**
// * Created by Reliese Model.
// */
//
//namespace App\Models;
//
//use Carbon\Carbon;
//use Illuminate\Database\Eloquent\Model;
//use Illuminate\Database\Eloquent\SoftDeletes;
//
///**
// * Class Member
// *
// * @property int $id
// * @property int $learner_id
// * @property string $first_name
// * @property string $last_name
// * @property Carbon $date_of_birth
// * @property string $gender
// * @property string $phone
// * @property string $city
// * @property string $province
// * @property string $current_status
// * @property string $education_level
// * @property string $field_of_study
// * @property string $interests
// * @property string $motivation
// * @property bool $previously_participated
// * @property string $hear_about_us
// * @property bool $receive_newsletter
// * @property string $cv_path
// * @property string $cin_path
// * @property string|null $motivation_letter_path
// * @property bool $data_consent
// * @property bool $values_consent
// * @property string|null $payment_mode
// * @property string|null $payment_proof_path
// * @property string|null $payment_reference
// * @property Carbon|null $payment_date
// * @property bool $has_paid
// * @property bool $fmdd_consent
// * @property string|null $payment_status
// * @property string $status
// * @property Carbon|null $registration_date
// * @property Carbon|null $created_at
// * @property Carbon|null $updated_at
// * @property string|null $deleted_at
// *
// * @property Learner $learner
// *
// * @package App\Models
// */
class Member extends Model
{
//	use SoftDeletes;
//	protected $table = 'members';

	protected $casts = [
//		'learner_id' => 'int',
//		'date_of_birth' => 'datetime',
//		'previously_participated' => 'bool',
//		'receive_newsletter' => 'bool',
//		'data_consent' => 'bool',
//		'values_consent' => 'bool',
//		'payment_date' => 'datetime',
//		'has_paid' => 'bool',
//		'fmdd_consent' => 'bool',
//		'registration_date' => 'datetime'
	];

	protected $fillable = [
//		'learner_id',
//		'first_name',
//		'last_name',
//		'date_of_birth',
//		'gender',
//		'phone',
//		'city',
//		'province',
//		'current_status',
//		'education_level',
//		'field_of_study',
//		'interests',
//		'motivation',
//		'previously_participated',
//		'hear_about_us',
//		'receive_newsletter',
//		'cv_path',
//		'cin_path',
//		'motivation_letter_path',
//		'data_consent',
//		'values_consent',
//		'payment_mode',
//		'payment_proof_path',
//		'payment_reference',
//		'payment_date',
//		'has_paid',
//		'fmdd_consent',
//		'payment_status',
//		'status',
//		'registration_date'
	];
//
//	public function learner()
//	{
//		return $this->belongsTo(Learner::class);
//	}
}
